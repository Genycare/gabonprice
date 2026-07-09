-- ============ helpers ============

create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce((select u.is_admin from public.users u where u.id = uid), false);
$$;

create or replace function public.compute_user_level(karma int)
returns text
language sql
immutable
as $$
  select case
    when karma >= 2000 then 'Expert'
    when karma >= 500 then 'Confirmé'
    when karma >= 100 then 'Contributeur'
    else 'Débutant'
  end;
$$;

-- ============ users: auto level + auto profile on signup ============

create or replace function public.users_set_level()
returns trigger
language plpgsql
as $$
begin
  new.level := public.compute_user_level(new.karma_score);
  return new;
end;
$$;

create trigger users_set_level_trigger
before insert or update of karma_score on public.users
for each row execute function public.users_set_level();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.users (id, phone, username)
  values (
    new.id,
    coalesce(new.phone, ''),
    'user_' || substr(new.id::text, 1, 8)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- ============ products: search_vector maintenance ============

create or replace function public.products_set_search_vector()
returns trigger
language plpgsql
as $$
begin
  new.search_vector := to_tsvector('french', coalesce(new.name, '') || ' ' || coalesce(new.category, ''));
  return new;
end;
$$;

create trigger products_set_search_vector_trigger
before insert or update of name, category on public.products
for each row execute function public.products_set_search_vector();

-- ============ shared: recalc median / trend / history for a product ============

create or replace function public.recalc_product_median(p_product_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_median numeric;
  v_prev_median numeric;
  v_trend numeric;
begin
  select percentile_cont(0.5) within group (order by amount)
    into v_median
    from public.prices
    where product_id = p_product_id and status = 'active';

  select median_price into v_prev_median
    from public.price_history
    where product_id = p_product_id and recorded_on <= current_date - interval '7 days'
    order by recorded_on desc
    limit 1;

  if v_median is not null and v_prev_median is not null and v_prev_median <> 0 then
    v_trend := round(((v_median - v_prev_median) / v_prev_median) * 100, 2);
  else
    v_trend := null;
  end if;

  update public.products
    set median_price = v_median,
        price_trend_7d = v_trend
    where id = p_product_id;

  if v_median is not null then
    insert into public.price_history (product_id, median_price, recorded_on)
    values (p_product_id, v_median, current_date)
    on conflict (product_id, recorded_on)
    do update set median_price = excluded.median_price;
  end if;
end;
$$;

-- ============ prices: outlier flag (before insert) ============

create or replace function public.prices_set_outlier_flag()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_current_median numeric;
begin
  select percentile_cont(0.5) within group (order by amount)
    into v_current_median
    from public.prices
    where product_id = new.product_id and status = 'active';

  if v_current_median is not null and v_current_median <> 0
     and abs(new.amount - v_current_median) / v_current_median > 0.6 then
    new.is_median_outlier := true;
  else
    new.is_median_outlier := false;
  end if;

  return new;
end;
$$;

create trigger prices_set_outlier_flag_trigger
before insert on public.prices
for each row execute function public.prices_set_outlier_flag();

-- ============ prices: after insert (karma + median recalc) ============

create or replace function public.prices_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.users set karma_score = karma_score + 10 where id = new.user_id;
  perform public.recalc_product_median(new.product_id);
  return new;
end;
$$;

create trigger prices_after_insert_trigger
after insert on public.prices
for each row execute function public.prices_after_insert();

-- ============ prices: after update (status transitions + recalc) ============

create or replace function public.prices_after_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if old.status is distinct from new.status and new.status = 'removed' and old.status <> 'removed' then
    update public.users set karma_score = karma_score - 15 where id = new.user_id;
  end if;

  if old.status is distinct from new.status or old.amount is distinct from new.amount
     or old.product_id is distinct from new.product_id then
    perform public.recalc_product_median(new.product_id);
    if old.product_id is distinct from new.product_id then
      perform public.recalc_product_median(old.product_id);
    end if;
  end if;

  return new;
end;
$$;

create trigger prices_after_update_trigger
after update on public.prices
for each row execute function public.prices_after_update();

-- ============ prices: after delete (recalc) ============

create or replace function public.prices_after_delete()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.recalc_product_median(old.product_id);
  return old;
end;
$$;

create trigger prices_after_delete_trigger
after delete on public.prices
for each row execute function public.prices_after_delete();

-- ============ price_ratings: votes -> counts, karma, auto moderation ============

create or replace function public.handle_price_rating_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_owner uuid;
  v_helpful int;
  v_unhelpful int;
  v_net_negative int;
  v_status text;
begin
  if tg_op = 'INSERT' then
    select user_id into v_owner from public.prices where id = new.price_id;
    if new.rating = 1 then
      update public.prices set helpful_votes = helpful_votes + 1 where id = new.price_id;
      update public.users set karma_score = karma_score + 2 where id = v_owner;
    else
      update public.prices set unhelpful_votes = unhelpful_votes + 1 where id = new.price_id;
      update public.users set karma_score = karma_score - 1 where id = v_owner;
    end if;

  elsif tg_op = 'UPDATE' then
    if old.rating <> new.rating then
      select user_id into v_owner from public.prices where id = new.price_id;
      if old.rating = 1 then
        update public.prices set helpful_votes = helpful_votes - 1 where id = new.price_id;
        update public.users set karma_score = karma_score - 2 where id = v_owner;
      else
        update public.prices set unhelpful_votes = unhelpful_votes - 1 where id = new.price_id;
        update public.users set karma_score = karma_score + 1 where id = v_owner;
      end if;
      if new.rating = 1 then
        update public.prices set helpful_votes = helpful_votes + 1 where id = new.price_id;
        update public.users set karma_score = karma_score + 2 where id = v_owner;
      else
        update public.prices set unhelpful_votes = unhelpful_votes + 1 where id = new.price_id;
        update public.users set karma_score = karma_score - 1 where id = v_owner;
      end if;
    end if;

  elsif tg_op = 'DELETE' then
    select user_id into v_owner from public.prices where id = old.price_id;
    if old.rating = 1 then
      update public.prices set helpful_votes = helpful_votes - 1 where id = old.price_id;
      update public.users set karma_score = karma_score - 2 where id = v_owner;
    else
      update public.prices set unhelpful_votes = unhelpful_votes - 1 where id = old.price_id;
      update public.users set karma_score = karma_score + 1 where id = v_owner;
    end if;
  end if;

  select helpful_votes, unhelpful_votes, status
    into v_helpful, v_unhelpful, v_status
    from public.prices
    where id = coalesce(new.price_id, old.price_id);

  v_net_negative := v_unhelpful - v_helpful;

  if v_status = 'active' and v_net_negative >= 5 then
    update public.prices set status = 'removed' where id = coalesce(new.price_id, old.price_id);
  elsif v_status = 'active' and v_net_negative >= 3 then
    update public.prices set status = 'flagged' where id = coalesce(new.price_id, old.price_id);
  end if;

  return coalesce(new, old);
end;
$$;

create trigger price_ratings_after_change_trigger
after insert or update or delete on public.price_ratings
for each row execute function public.handle_price_rating_change();

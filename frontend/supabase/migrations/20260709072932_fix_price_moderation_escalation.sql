-- Fix: a price stuck at `flagged` could never escalate to `removed`
-- because both thresholds were guarded by `status = 'active'`. Once a
-- price became `flagged`, further downvotes no longer matched that guard.
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

  -- Escalate active -> flagged -> removed as votes accumulate. Once
  -- `removed`, only an admin override (manual UPDATE) restores it; votes
  -- alone never move a price back down in severity.
  if v_status <> 'removed' and v_net_negative >= 5 then
    update public.prices set status = 'removed' where id = coalesce(new.price_id, old.price_id);
  elsif v_status = 'active' and v_net_negative >= 3 then
    update public.prices set status = 'flagged' where id = coalesce(new.price_id, old.price_id);
  end if;

  return coalesce(new, old);
end;
$$;

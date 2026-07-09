-- Drop the security-definer view flagged by the linter; replace with a
-- broad row-visibility policy + column-level grants so anon/authenticated
-- can read safe profile fields (username, karma, level) but never phone.

drop view if exists public.user_profiles;

create policy "users_select_public_columns"
on public.users for select
to anon, authenticated
using (true);

revoke select on public.users from anon, authenticated;
grant select (id, username, karma_score, level, preferred_province, created_at)
  on public.users to anon, authenticated;

-- Let a user fetch their own full profile (incl. phone) explicitly.
create or replace function public.get_my_profile()
returns public.users
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select * from public.users where id = auth.uid();
$$;

revoke execute on function public.get_my_profile() from public;
grant execute on function public.get_my_profile() to authenticated;

-- Tighten the "any authenticated user can add a product" policy: require
-- non-empty name/category rather than an unconditional WITH CHECK (true).
drop policy if exists "products_insert_authenticated" on public.products;

create policy "products_insert_authenticated"
on public.products for insert
to authenticated
with check (char_length(trim(name)) > 0 and char_length(trim(category)) > 0);

-- Pin search_path on all SQL/PLpgSQL functions (fixes function_search_path_mutable).
alter function public.compute_user_level(int) set search_path = public, pg_temp;
alter function public.users_set_level() set search_path = public, pg_temp;
alter function public.products_set_search_vector() set search_path = public, pg_temp;

-- These functions only need to run as triggers or via the explicit RPCs
-- above; they must not be directly callable over PostgREST.
revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;
revoke execute on function public.handle_price_rating_change() from public, anon, authenticated;
revoke execute on function public.prices_after_delete() from public, anon, authenticated;
revoke execute on function public.prices_after_insert() from public, anon, authenticated;
revoke execute on function public.prices_after_update() from public, anon, authenticated;
revoke execute on function public.prices_set_outlier_flag() from public, anon, authenticated;
revoke execute on function public.recalc_product_median(uuid) from public, anon, authenticated;

revoke execute on function public.is_admin(uuid) from public, anon;
grant execute on function public.is_admin(uuid) to authenticated;

-- Drop the now-redundant row policy: sensitive columns (phone, is_admin,
-- is_banned) were never granted to anon/authenticated at the column level,
-- so this policy no longer gates anything extra beyond users_select_public_columns
-- and was only causing "multiple permissive policies" overhead.
drop policy if exists "users_select_own_or_admin" on public.users;

-- Wrap auth.<function>() calls in (select ...) so Postgres evaluates them
-- once per query instead of once per row (see auth_rls_initplan lint).

alter policy "users_update_own_or_admin" on public.users
  using (id = (select auth.uid()) or public.is_admin())
  with check (id = (select auth.uid()) or public.is_admin());

alter policy "prices_select_active_or_own_or_admin" on public.prices
  using (status = 'active' or user_id = (select auth.uid()) or public.is_admin());

alter policy "prices_insert_own" on public.prices
  with check (user_id = (select auth.uid()));

alter policy "prices_update_own_or_admin" on public.prices
  using (user_id = (select auth.uid()) or public.is_admin())
  with check (user_id = (select auth.uid()) or public.is_admin());

alter policy "prices_delete_own_or_admin" on public.prices
  using (user_id = (select auth.uid()) or public.is_admin());

alter policy "price_ratings_insert_own" on public.price_ratings
  with check (user_id = (select auth.uid()));

alter policy "price_ratings_update_own" on public.price_ratings
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

alter policy "price_ratings_delete_own" on public.price_ratings
  using (user_id = (select auth.uid()));

alter policy "price_reports_select_own_or_admin" on public.price_reports
  using (user_id = (select auth.uid()) or public.is_admin());

alter policy "price_reports_insert_own" on public.price_reports
  with check (user_id = (select auth.uid()));

alter policy "price_reports_update_admin" on public.price_reports
  using (public.is_admin())
  with check (public.is_admin());

-- Missing covering indexes on foreign keys.
create index price_ratings_user_id_idx on public.price_ratings (user_id);
create index price_reports_price_id_idx on public.price_reports (price_id);
create index price_reports_user_id_idx on public.price_reports (user_id);

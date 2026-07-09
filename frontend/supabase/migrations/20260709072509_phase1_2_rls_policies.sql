-- ============ users ============

alter table public.users enable row level security;

create policy "users_select_own_or_admin"
on public.users for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy "users_update_own_or_admin"
on public.users for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- Public-safe view: never exposes phone. Owned by the migration role, which
-- bypasses the base table's RLS, so anon/authenticated can read safe columns
-- (username, karma, level) without ever getting the phone number.
create view public.user_profiles
with (security_invoker = false)
as
select id, username, karma_score, level, preferred_province, created_at
from public.users;

grant select on public.user_profiles to anon, authenticated;

-- ============ products ============

alter table public.products enable row level security;

create policy "products_select_all"
on public.products for select
to anon, authenticated
using (true);

create policy "products_insert_authenticated"
on public.products for insert
to authenticated
with check (true);

-- ============ prices ============

alter table public.prices enable row level security;

create policy "prices_select_active_or_own_or_admin"
on public.prices for select
to anon, authenticated
using (status = 'active' or user_id = auth.uid() or public.is_admin());

create policy "prices_insert_own"
on public.prices for insert
to authenticated
with check (user_id = auth.uid());

create policy "prices_update_own_or_admin"
on public.prices for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "prices_delete_own_or_admin"
on public.prices for delete
to authenticated
using (user_id = auth.uid() or public.is_admin());

-- ============ price_ratings ============

alter table public.price_ratings enable row level security;

create policy "price_ratings_select_all"
on public.price_ratings for select
to authenticated
using (true);

create policy "price_ratings_insert_own"
on public.price_ratings for insert
to authenticated
with check (user_id = auth.uid());

create policy "price_ratings_update_own"
on public.price_ratings for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "price_ratings_delete_own"
on public.price_ratings for delete
to authenticated
using (user_id = auth.uid());

-- ============ price_reports ============

alter table public.price_reports enable row level security;

create policy "price_reports_select_own_or_admin"
on public.price_reports for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "price_reports_insert_own"
on public.price_reports for insert
to authenticated
with check (user_id = auth.uid());

create policy "price_reports_update_admin"
on public.price_reports for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============ price_history ============

alter table public.price_history enable row level security;

create policy "price_history_select_all"
on public.price_history for select
to anon, authenticated
using (true);

-- No insert/update/delete policy: writes only happen via the
-- security-definer recalc_product_median() function.

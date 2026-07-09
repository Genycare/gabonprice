-- is_admin() is evaluated as part of RLS policies that apply to the `anon`
-- role too (e.g. prices_select_active_or_own_or_admin), so anon must keep
-- EXECUTE or anonymous reads break with a permission error. The remaining
-- linter WARN here is an accepted trade-off (it only reveals whether an
-- arbitrary uuid belongs to an admin, not any other data).
grant execute on function public.is_admin(uuid) to anon;

-- get_my_profile() should only ever be called by a signed-in user.
revoke execute on function public.get_my_profile() from anon;

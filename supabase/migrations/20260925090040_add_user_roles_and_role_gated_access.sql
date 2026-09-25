-- Sustainable Suppliers Dashboard v1.1 — role-based access
-- Adds user_roles, a role-check helper, and role-gates submission_reviews writes.
-- Never touches respondents / ecovadis_submissions / questionnaire_submissions
-- or any anon-facing policy/grant owned by the sibling Supplier Engagement Portal.

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null check (role in ('administrator','reviewer','user')),
  updated_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;
revoke all on public.user_roles from anon, public;
grant select, insert, update on public.user_roles to authenticated;

-- Reads the caller's own role. SECURITY DEFINER so it is not subject to the
-- RLS it is used inside (avoids recursion); owned by the migration role,
-- which owns user_roles, so it bypasses RLS on that table by default.
create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = ''
stable
as $$
  select role from public.user_roles where user_id = auth.uid();
$$;

revoke all on function public.current_user_role() from anon, public;
grant execute on function public.current_user_role() to authenticated;

-- user_roles: everyone reads their own row; an Administrator reads all rows,
-- including their own, and is the only one who may write any row (including
-- their own — a single Administrator must never be locked out of the app).
create policy "read own row or all if administrator" on public.user_roles
  for select
  to authenticated
  using (user_id = auth.uid() or public.current_user_role() = 'administrator');

create policy "administrator inserts any row" on public.user_roles
  for insert
  to authenticated
  with check (public.current_user_role() = 'administrator');

create policy "administrator updates any row" on public.user_roles
  for update
  to authenticated
  using (public.current_user_role() = 'administrator')
  with check (public.current_user_role() = 'administrator');
-- No delete policy on user_roles: default deny.

-- submission_reviews: read stays open to every authenticated caller
-- (Administrator, Reviewer, User, no role) — unchanged. Write narrows from
-- v1.0's unconditional `using (true)` to Administrator/Reviewer only.
drop policy "authenticated insert submission_reviews" on public.submission_reviews;
drop policy "authenticated update submission_reviews" on public.submission_reviews;

create policy "administrator or reviewer insert submission_reviews" on public.submission_reviews
  for insert
  to authenticated
  with check (public.current_user_role() in ('administrator','reviewer'));

create policy "administrator or reviewer update submission_reviews" on public.submission_reviews
  for update
  to authenticated
  using (public.current_user_role() in ('administrator','reviewer'))
  with check (public.current_user_role() in ('administrator','reviewer'));
-- No delete policy on submission_reviews: unchanged, default deny.

-- Seed: the builder's own account becomes Administrator so it is never a
-- "no role" account mid-migration.
insert into public.user_roles (user_id, role)
values ('51a9a843-d802-4c91-8399-23bc381f6da6', 'administrator');

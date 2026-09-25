# Supabase Setup — Sustainable Suppliers Dashboard — Internal Use Only

**Last updated:** 2026-09-25 — Session 4 (v1.1 role-based access)

This tool shares a Supabase project with **Supplier Engagement Portal**. This file
documents only what THIS tool added. For the full picture of the shared project
(the three tables this tool reads from), see [docs/supabase-setup-portal.md](supabase-setup-portal.md).

## Project

| Detail | Value |
|---|---|
| Name | AI Lab project supplier portal |
| Project ID | `yfshmobaatyruymcpbex` |
| Project URL | https://yfshmobaatyruymcpbex.supabase.co |
| Dashboard | https://supabase.com/dashboard/project/yfshmobaatyruymcpbex |
| Plan | Free — confirmed by the builder; the project pauses after ~1 week of no traffic, now affecting both tools sharing it |

## Tables added by this tool

### `submission_reviews` (v1.0)
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | default `gen_random_uuid()` |
| respondent_id | uuid, not null, **unique** | FK → `respondents(id)` on delete cascade — one review record per supplier |
| review_status | text, not null | `new_to_be_analysed` (default) \| `need_review` \| `final_submission` |
| updated_at | timestamptz, not null | default `now()` |

### `user_roles` (v1.1)
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | default `gen_random_uuid()` |
| user_id | uuid, not null, **unique** | FK → `auth.users(id)` on delete cascade — one role per team member |
| role | text, not null, no default | `administrator` \| `reviewer` \| `user`; **no row = no role**, treated by the app as read-only (same as `user`), never a crash or an implicit admin grant |
| updated_at | timestamptz, not null | default `now()` |

There is no `profiles` table in this tool — identity is `auth.users` (email, id) plus `user_roles` (role). Deliberate deviation from the framework's default profiles pattern, confirmed in docs/access-matrix.md Section 3.

## RLS and access changes made by this tool

**`submission_reviews` (v1.0, changed in v1.1):** RLS enabled. Read: `authenticated`, all rows, `using (true)` — unchanged, every role including "no role" reads everything. Write (insert/update): narrowed in v1.1 from the original `using (true)` to role-gated policies restricted to Administrator or Reviewer (see below). No delete policy. No `anon` access at all.

**New table `user_roles` (v1.1):** RLS enabled. `authenticated` granted SELECT/INSERT/UPDATE (no DELETE grant/policy — default deny). No `anon` grant at all.
- Read: own row (`user_id = auth.uid()`) always; every row when the caller's own role is `administrator`.
- Insert/update: Administrator only, for any row including their own — a single Administrator must never be locked out; blocking self-edit would risk that with no recovery but the Supabase dashboard.
- Mechanism: a helper function `public.current_user_role()` (`SECURITY DEFINER`, `search_path = ''`, `stable`) reads the caller's row and is used inside every policy above and inside the `submission_reviews` write policies below, avoiding recursive RLS on `user_roles` itself (it runs as the table owner, which bypasses RLS by default). `EXECUTE` on it is granted to `authenticated` only (required for policies to evaluate it) — the Supabase security advisor flags it as callable via `/rest/v1/rpc/current_user_role`; this is expected and safe, since it only ever returns the caller's own role, equivalent to what the SELECT policy already allows them to read directly.
- `submission_reviews` insert/update policies now read `public.current_user_role() in ('administrator','reviewer')` instead of `(true)`.
- Neither `submission_reviews` nor `user_roles` has a frozen/final row — both stay editable by whoever the matrix grants write to; there is no document here to freeze.

**Additive READ-ONLY access on the existing portal tables**, for the `authenticated` role only — nothing on `anon` was touched:
- `respondents`: `grant select ... to authenticated` + policy `authenticated read respondents` (`using (true)`)
- `ecovadis_submissions`: `grant select ... to authenticated` + policy `authenticated read ecovadis_submissions` (`using (true)`)
- `questionnaire_submissions`: `grant select ... to authenticated` + policy `authenticated read questionnaire_submissions` (`using (true)`)

Before this change, the `authenticated` role had zero grants on any of these three tables (confirmed via `information_schema.role_table_grants` before applying the migration) — same lockdown as `anon`, since the portal never used Supabase Auth. This tool is the first to introduce Supabase Auth into this project.

**Untouched, verified after migration:** all five existing RPC functions (`capture_respondent`, `mark_respondent_complete`, `get_questionnaire_progress`, `save_ecovadis_submission`, `save_questionnaire_submission`) and every existing `anon`-facing grant/policy. See docs/supabase-setup-portal.md for their definitions.

## Auth

Method: email and password. Signup: invite-only — the builder invites team members directly via the Supabase dashboard (Authentication → Users → Invite). Email/password auth is Supabase's default provider and is confirmed working (sign-in tested live on 2026-09-16).

**Forgot-password flow (added 2026-09-21):** index.html calls `auth.resetPasswordForEmail(email, { redirectTo: <site origin>/reset-password.html })`; the emailed link lands on reset-password.html, which reads the recovery session from the URL and calls `auth.updateUser({ password })`. Verified live with a recovery link generated via the Admin API (mismatch check, successful change, old password rejected, invalid-link state).

**Auth URL configuration — project-wide, applies to both tools sharing this project:** the recovery link only returns to the dashboard if `https://miadb.netlify.app/**` is in Authentication → URL Configuration → Redirect URLs. Initially it was NOT: on 2026-09-21 a link generated with that `redirect_to` came back pointing at the Site URL (`http://localhost:3000`), and the builder's first real email led to a dead page. After the builder added `https://miadb.netlify.app/**` and `https://miadb.netlify.app/reset-password.html`, links generated via the Admin API redirect correctly. Adding entries is additive — it does not affect the Supplier Engagement Portal, which uses no Auth.

**Email delivery caveat:** Supabase's built-in email sender is heavily rate-limited and, on the default setup, only delivers to addresses belonging to the Supabase organisation/project team. Team members outside the Supabase org may not receive reset (or invite) emails until a custom SMTP provider is configured under Authentication → SMTP Settings. Not tested end-to-end with a real inbox.

## File access

The `submissions` Storage bucket (owned by Supplier Engagement Portal) has no policy granting `authenticated` users direct read access. This tool's Supplier Detail view generates short-lived signed URLs server-side, via a Netlify Function using `SUPABASE_SERVICE_ROLE_KEY` — not through a client-side Storage policy.

**New in v1.1 — Manage Users listing:** `netlify/functions/list-users.js` reads `auth.users` directly (only possible server-side, with the service role key) and joins it with `user_roles`. It verifies the caller's session via `auth.getUser(token)`, then checks the caller's own `user_roles.role = administrator` using the admin client (bypassing RLS, checked in code, not trusted from a header) before returning anything. Returns 403 for a valid session that is not an Administrator.

## Migrations applied

- 2026-09-16, `add_sustainable_suppliers_dashboard_schema` — `submission_reviews`, the three read-only policies on the portal's tables.
- 2026-09-25, `add_user_roles_and_role_gated_access` (v1.1) — `user_roles` table, `current_user_role()` helper, `user_roles` RLS, replaced `submission_reviews` write policies with role-gated ones, seeded the builder's own account as `administrator`. Verified afterward: `pg_policies` shows the six expected policies (three on `submission_reviews`, three on `user_roles`); `select * from user_roles` shows one row (the builder, `administrator`); `get_advisors(security)` shows no new issue beyond the expected `current_user_role()` RPC-exposure warning (explained above) — every pre-existing sibling-tool finding is untouched and unrelated to this change.
- 2026-09-25, `revoke_stray_anon_grant_on_submission_reviews` (v1.1, corrective) — **found during the refusal-test gate:** `submission_reviews` (owned by this tool) carried full table grants (SELECT/INSERT/UPDATE/DELETE) to `anon`, left over from the original v1.0 migration — contradicting product-spec.md, docs/access-matrix.md and CLAUDE.md Hard Rule 1. RLS already blocked anon writes (no anon-targeted policy existed), so it was not exploitable, but a stray grant is a loaded gun for the next policy change. Confirmed the sibling-owned tables (`respondents`, `ecovadis_submissions`, `questionnaire_submissions`) carry no such grant — this was isolated to `submission_reviews`. Revoked; anon now gets `permission denied` on that table too, matching `user_roles`.

## Notes for future sessions

- `submission_reviews.respondent_id` is UNIQUE by design (one row per respondent) — if a future version needs a history of status changes over time, this would need to become a log table instead.
- Reviewer and User roles have no real named holder yet — the Access Architect's placeholder identities (Revisore Pilota, Utente Pilota) are documented in docs/access-matrix.md and docs/user-stories.md but have **no `user_roles` row and no Supabase Auth account** until the builder actually invites real people via Authentication → Users → Invite and assigns their role in Manage Users. Re-run the refusal test (PROGRESS.md) as real people once invited.
- The Refusal test record in PROGRESS.md is the authoritative record of what was actually tried against the API for this access phase — read it before assuming any `no` cell above has been verified end-to-end.

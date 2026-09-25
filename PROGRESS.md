# PROGRESS — Sustainable Suppliers Dashboard — Internal Use Only

> Claude Code: read this file at the start of every session, before touching anything. Update it at every save point. Replace content — do not append. History lives in git.

**Session:** 4
**Last updated:** 2026-09-25 — Session 4, v1.1 role-based access built
**Live URL:** https://miadb.netlify.app (public) — v1.1 code pushed, deploy pending this save point
**Stage:** login and access rules together — v1.1's role-based authorization (Administrator/Reviewer/User) is built and Half A of the refusal gate has passed; Half B (the named people, on the real screens) is the one thing left before this stage closes
**Supabase project:** created — ref yfshmobaatyruymcpbex, URL https://yfshmobaatyruymcpbex.supabase.co (existing, shared with Supplier Engagement Portal)

## Current state
Live and verified end-to-end (pre-v1.1): login, forgot-password, Summary (stat cards + pie chart), Red Flags, searchable Suppliers Table, Supplier Detail with signed file links, two-page navigation. Built this session, not yet live-verified: `user_roles` table and role-gated RLS (migrated and Half-A tested directly against the database — see Refusal test record), the Manage Users screen (dashboard.html) and its `list-users.js` function, role-based conditional rendering (Review Status editable only for Administrator/Reviewer; Manage Users nav only for Administrator). Valentina's own account is seeded as `administrator`; Reviewer and User have no real holder yet (placeholders only, not real Supabase accounts).

## Last session
Session 4 (2026-09-25): Built v1.1's role-based access. Migration `add_user_roles_and_role_gated_access` added `user_roles`, the `current_user_role()` helper, and role-gated `submission_reviews` policies; seeded Valentina as administrator. Found and fixed a pre-existing issue while running the refusal gate: `submission_reviews` carried a stray full table grant to `anon` from the v1.0 migration (RLS already blocked writes, so not exploitable, but it contradicted the documented contract) — revoked via `revoke_stray_anon_grant_on_submission_reviews`; confirmed the sibling's own tables were never affected. Built the Manage Users screen, `netlify/functions/list-users.js`, and role-based rendering in dashboard.html. Ran Half A of the refusal gate directly against the database (see Refusal test record) — all passed. Updated docs/supabase-setup.md.
Session 3 (2026-09-23): Builder confirmed a real forgot-password email arrived and its link opened "Choose a new password" correctly.
(Session 1, 2026-09-16→18: full build, Type column, pie chart, two-page split; details in git history. Session 2, 2026-09-21: forgot-password added; details in git history.)

## Remaining work
- [x] Builder: requested a real reset email and confirmed the link lands on "Choose a new password"
- [ ] Decide on custom SMTP (Authentication → SMTP Settings) if team members outside the Supabase org need reset/invite emails
- [ ] Invite the real team member(s) via Authentication → Users → Invite; the builder already has her own working account. Now also required to assign real Reviewer/User roles (see Build decisions — placeholders in use until then)
- [ ] Acceptance criteria pass — verify every criterion in spec Section "Acceptance Criteria" (v1.0 criteria 1–9 plus v1.1 criteria 10–16) before deploy
- [ ] Decide whether to add a Netlify-level password on top of the app's own login
- [ ] Optional cleanup: decide what to do with the unrelated duplicate Netlify site "frabjous-dolphin-72bbf3" (belongs to the sibling repo, not this one)
- [x] (v1.1 revision) Add the `user_roles` table (named migration) with RLS enabled from creation, and the role-check helper function, per docs/access-matrix.md
- [x] (v1.1 revision) Replace `submission_reviews`' existing `using (true)`/`with check (true)` policies with role-gated policies (Administrator/Reviewer write, everyone read) per docs/access-matrix.md
- [x] (v1.1 revision) Seed Valentina's own `user_roles` row (role = administrator) as part of the migration, so her existing account is never a "no role" account mid-migration
- [x] (v1.1 revision) Build the Manage Users screen (Administrator-only) and its service-role-backed account-listing Netlify Function (`list-users.js`), gated on the caller's own role
- [x] (v1.1 revision) Add role-based conditional rendering across existing screens: Review Status editable for Administrator/Reviewer, read-only text for User and no-role accounts; Manage Users hidden and unreachable for non-Administrators
- [x] (v1.1 revision) Update docs/supabase-setup.md with the new table, policies, function and role-check helper
- [x] (v1.1 revision) GATE, half A (Claude Code) — try every `no` cell and the `user_roles` "own row" boundary through the API as each named person's session and as a logged-out visitor; paste results into the Refusal test record below
- [ ] (v1.1 revision) GATE, half B (the named people) — Valentina logs in as herself (Administrator) and, once invited, as the two placeholders (Revisore Pilota, Utente Pilota); confirms every `no` is refused and every `own` returns only the right rows on the real screens (not just the database). Not yet run — needs a live deploy and, for the two placeholders, real Supabase Auth invites first
- [ ] (v1.1 revision) Push to main → Netlify auto-deploys
- [ ] (v1.1 revision) Invite Revisore Pilota (lucchini.v+revisore@gmail.com) and Utente Pilota (lucchini.v+utente@gmail.com) via Authentication → Users → Invite, then assign their roles in Manage Users, so Half B can actually be run as three distinct logged-in identities

## Refusal test record
Filled by Claude Code at half A and by the builder at half B: date, who, cell tried, result. Kept, never cleared; any change to a rule re-runs both halves before the push.

**Half A — Claude Code, 2026-09-25.** Only one real account exists (Valentina). Tested directly against Postgres by switching to the `authenticated`/`anon` roles and setting `request.jwt.claims` to simulate each identity — the same role/RLS mechanism PostgREST uses for every real API call, run for both the freshly-created tables and one pre-existing table. Reviewer and User were simulated by temporarily setting Valentina's own real `user_roles` row to that role inside a transaction, then rolling back — her real row was never actually changed (confirmed: still `administrator` after every test).

| # | Simulated caller | Tried | Result | Cell |
|---|---|---|---|---|
| 1 | anon | `select` on `user_roles` | refused — `permission denied for table user_roles` | user_roles · read · anon |
| 2 | anon | `select` on `submission_reviews` | initially **succeeded** (0 rows, no error) — anon had a stray full grant left from v1.0; fixed (see Build decisions/supabase-setup.md), re-tested: refused — `permission denied` | submission_reviews · read · anon |
| 3 | anon | `insert` on `submission_reviews` | refused — RLS violation (blocked even before the grant fix, since no anon policy existed) | submission_reviews · create · anon |
| 4 | authenticated, no `user_roles` row (random uuid) | `current_user_role()`, count of visible `user_roles` rows | `null`, `0` — no own row, not admin | user_roles · read · no role |
| 5 | authenticated, no role | `insert` into `user_roles` for another id | refused — RLS violation | user_roles · create · no role |
| 6 | authenticated, no role | `select` on `submission_reviews` | succeeded, 0 rows (table empty) — read is open to every authenticated caller as designed | submission_reviews · read · no role |
| 7 | authenticated, no role | `insert` into `submission_reviews` | refused — RLS violation | submission_reviews · create · no role |
| 8 | Valentina, role temporarily `reviewer` | `insert` into `submission_reviews` | **succeeded** (rolled back after) — Reviewer write grant confirmed working | submission_reviews · create · Reviewer |
| 9 | Valentina, role temporarily `reviewer` | `insert` into `user_roles` for a new id | refused — RLS violation (only Administrator writes `user_roles`) | user_roles · create · Reviewer |
| 10 | Valentina, role temporarily `user` | `insert` into `submission_reviews` | refused — RLS violation | submission_reviews · create · User |
| 11 | Valentina, own row temporarily deleted (= no role) | `current_user_role()`, readable `submission_reviews`, visible `user_roles` rows | `null`, `0` (empty table), `0` — matches "no role" behaviour exactly | user_roles / submission_reviews · read · no role |
| 12 | Valentina, own row temporarily deleted | `insert` into `submission_reviews` | refused — RLS violation | submission_reviews · create · no role |
| 13 | Valentina, real administrator, unmodified | `delete` from `user_roles` (her own row) | refused — 0 rows actually deleted (`with ... returning *` confirmed), no DELETE policy exists | user_roles · delete · Administrator |
| 14 | (post-check) | `select * from user_roles` after every test above | exactly one row: Valentina, `administrator` — confirms no simulation leaked past its rollback | — |

Not yet run (needs a live deploy and real accounts): the `list-users.js` function's own role gate against a non-Administrator session; every test above as an actual logged-in browser session rather than a simulated database role. Half B below covers this.

**Half B — the named people.** Not yet run. Needs: (1) this code pushed and deployed, (2) Revisore Pilota and Utente Pilota actually invited via the Supabase dashboard and assigned their roles in Manage Users. Until then this phase is not considered closed.

## Build decisions
- The `authenticated` role had zero grants on respondents/ecovadis_submissions/questionnaire_submissions before this build (same lockdown as anon) — explicit `grant select ... to authenticated` was required in addition to the RLS policies, since a policy alone does nothing without the base grant.
- submission_reviews RLS uses `using (true)`/`with check (true)` for all authenticated operations in v1.0 — being replaced in v1.1 by role-gated policies (Administrator/Reviewer write).
- Switched from the specced React + Vite + Tailwind to plain HTML/CSS/JS (builder approved) — no Node.js in the build environment to test a Vite build locally before pushing. No functional change from the spec.
- Forgot-password (added at builder's request, beyond spec v1.0): the request form shows the same neutral "if an account exists…" message whether or not the email exists; new passwords require ≥ 8 characters, checked client-side.
- Pie chart is hand-drawn inline SVG (no charting library) — three slices only, not worth a dependency.
- Two-page split (Summary / Details) implemented as two `<div>`s toggled via `hidden`, not separate HTML files — keeps a single shared data load and avoids a second auth/session check.
- v1.1 (2026-09-25): Access Architect and Project Governor skills run to add role-based access; CLAUDE.md regenerated accordingly. No code changed yet — this is a docs-only save point ahead of the build session.
- Reviewer and User roles use placeholder named holders (Revisore Pilota / Utente Pilota, Gmail plus-addressing aliases of the builder's own address) until real team members are invited — required by the Access Architect's naming rule to make the access stage testable. Swap in real people's names/emails in both access files once invited, and re-run the refusal test as them.
- No `profiles` table: `user_roles` (keyed directly to `auth.users`) is the identity/role store for this tool, since Manage Users lists `auth.users` directly via a service-role function — a deliberate deviation from the framework's default profiles pattern, confirmed in docs/access-matrix.md Section 3.
- Administrator may change their own role via Manage Users (no self-edit block) — with a single Administrator today, blocking self-edit would risk a lockout only recoverable from the Supabase dashboard.
- Manage Users writes roles directly from the browser via `supabase.from('user_roles').upsert(...)`, not a server-side RPC — the existing `administrator inserts/updates any row` RLS policies already allow it, and `submission_reviews`' review-status save uses the same direct-upsert pattern, so this stays consistent with the tool's existing style rather than adding a narrow function for no added protection.
- Role check for Manage Users' own gate (`list-users.js`) queries `user_roles` with the service-role client directly (bypassing RLS, checked explicitly in code) rather than trusting a client-supplied role — mirrors `signed-file-url.js`'s existing "verify the session server-side" pattern.
- Fixed a pre-existing gap found by the Half-A refusal test: `submission_reviews` had a stray full table grant to `anon` from the v1.0 migration (RLS already blocked writes; not exploitable, but contradicted the documented contract). Revoked via a corrective migration; confirmed the sibling tool's own tables were never affected.

## Known issues
- Supabase's built-in email sender is rate-limited and (on the default setup) only delivers to Supabase org/project team addresses — a colleague outside the org may never receive a reset or invite email. Not tested with a real inbox.
- The Auth Site URL / Redirect URL settings are project-wide, shared with the Supplier Engagement Portal (which uses no Auth) — only ADD entries, never remove existing ones.
- Setting a Netlify env var with `envVarIsSecret: true` via the Netlify MCP tool silently fails to persist the value — always set without that flag, then verify with getAllEnvVars, and always redeploy after any env var change.
- Netlify MCP not activated for this repo — deploys happen via GitHub push, env vars are set manually.
- Brand colors provisional (#F7F8FA background, #14213D accent/text) — confirm before first deployment.
- Supabase project is on the Free plan, shared by two tools — pauses after ~1 week of no traffic, taking both tools offline together. Builder aware, staying on Free for now.
- Reviewer and User roles have no real named holder yet — placeholders in use (see Build decisions); re-run the refusal test as real people once invited.
- Spec revised to v1.1 on 2026-09-23 — CLAUDE.md regenerated by Project Governor on 2026-09-25.
- The v1.0 migration (`add_sustainable_suppliers_dashboard_schema`, applied 2026-09-16) was never saved as a file under supabase/migrations/ — only applied live via MCP. Found while adding the v1.1 migration files. Not backfilled (its exact original SQL isn't available to reconstruct faithfully); the two v1.1 migrations from this session are saved as files. supabase/migrations/ cannot fully rebuild this database from nothing until this is backfilled from the live schema.

## Backlog
- In-app invitation of new users — the builder chose to keep inviting via the Supabase dashboard directly
- Restricting which suppliers a role can see — all roles see all suppliers in this version; not requested
- Editing the supplier's original submission data — this tool remains read-only on the portal's own data
- CSV/data export, email alerts, AI-generated summaries, scheduled automation — not needed for this version
- Custom SMTP for Authentication emails — needed only if team members outside the Supabase org require reset/invite emails
- Netlify-level password on top of the app's own login — not requested in the spec
- Duplicate Netlify site "frabjous-dolphin-72bbf3" cleanup — belongs to the sibling repo, not this one
- Real named Reviewer and User — placeholders in use until the Administrator invites the second and third team member
- Handover: login upgrade path — magic link, OAuth or SSO; recommended beyond a small team; the rules do not change when the door changes
- Handover: Supabase Free plan — no backups, pauses when idle; reconsider Pro if this becomes disruptive

## Notes for next session
None.

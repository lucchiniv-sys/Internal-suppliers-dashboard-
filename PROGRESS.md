# PROGRESS — Sustainable Suppliers Dashboard — Internal Use Only

> Claude Code: read this file at the start of every session, before touching anything. Update it at every save point. Replace content — do not append. History lives in git.

**Session:** 3
**Last updated:** 2026-09-25 — docs regenerated for v1.1 by Project Governor (build session for this work is pending; Claude Code increments to Session 4 when it starts)
**Live URL:** https://miadb.netlify.app (public)
**Stage:** login and access rules together — v1.1 adds role-based authorization (Administrator/Reviewer/User) on top of the existing single-level login; building it is the next block of work
**Supabase project:** created — ref yfshmobaatyruymcpbex, URL https://yfshmobaatyruymcpbex.supabase.co (existing, shared with Supplier Engagement Portal)

## Current state
Live and verified end-to-end: login, forgot-password (including a real emailed reset link, confirmed working by the builder on 2026-09-23), Summary (stat cards + "Submissions by type" pie chart), Red Flags, searchable Suppliers Table (Type badge, inline Review Status), Supplier Detail with signed file links, two-page navigation (Summary first, button to Suppliers & Red Flags). Every logged-in team member currently has identical access — the v1.1 role split (Administrator/Reviewer/User, `user_roles` table, Manage Users screen) is specced and its access rules are written (docs/access-matrix.md, docs/user-stories.md) but not yet built.

## Last session
Session 3 (2026-09-23): Builder confirmed a real forgot-password email arrived and its link opened "Choose a new password" correctly — the flow is fully working, not just verified via the Admin API.
Since Session 3 (2026-09-25, no code changed): spec revised to v1.1 (A2 → A3, three roles, Manage Users screen). Access Architect wrote docs/access-matrix.md and docs/user-stories.md (full run — named people, ownership, the policy plan). Project Governor regenerated CLAUDE.md and this file accordingly. (Session 1, 2026-09-16→18: full build, Type column, pie chart, two-page split; details in git history. Session 2, 2026-09-21: forgot-password added; details in git history.)

## Remaining work
- [x] Builder: requested a real reset email and confirmed the link lands on "Choose a new password"
- [ ] Decide on custom SMTP (Authentication → SMTP Settings) if team members outside the Supabase org need reset/invite emails
- [ ] Invite the real team member(s) via Authentication → Users → Invite; the builder already has her own working account. Now also required to assign real Reviewer/User roles (see Build decisions — placeholders in use until then)
- [ ] Acceptance criteria pass — verify every criterion in spec Section "Acceptance Criteria" (v1.0 criteria 1–9 plus v1.1 criteria 10–16) before deploy
- [ ] Decide whether to add a Netlify-level password on top of the app's own login
- [ ] Optional cleanup: decide what to do with the unrelated duplicate Netlify site "frabjous-dolphin-72bbf3" (belongs to the sibling repo, not this one)
- [ ] (v1.1 revision) Add the `user_roles` table (named migration) with RLS enabled from creation, and the role-check helper function, per docs/access-matrix.md
- [ ] (v1.1 revision) Replace `submission_reviews`' existing `using (true)`/`with check (true)` policies with role-gated policies (Administrator/Reviewer write, everyone read) per docs/access-matrix.md
- [ ] (v1.1 revision) Seed Valentina's own `user_roles` row (role = administrator) as part of the migration, so her existing account is never a "no role" account mid-migration
- [ ] (v1.1 revision) Build the Manage Users screen (Administrator-only) and its service-role-backed account-listing Netlify Function (`list-users.js`), gated on the caller's own role
- [ ] (v1.1 revision) Add role-based conditional rendering across existing screens: Review Status editable for Administrator/Reviewer, read-only text for User and no-role accounts; Manage Users hidden and unreachable for non-Administrators
- [ ] (v1.1 revision) Update docs/supabase-setup.md with the new table, policies, function and role-check helper
- [ ] (v1.1 revision) GATE, half A (Claude Code) — try every `no` cell and the `user_roles` "own row" boundary through the API as each named person's session and as a logged-out visitor; paste results into the Refusal test record below
- [ ] (v1.1 revision) GATE, half B (the named people) — Valentina logs in as herself (Administrator) and as the two placeholders (Revisore Pilota, Utente Pilota) and confirms every `no` is refused and every `own` returns only the right rows; record as "tested via placeholder, pending a real second/third team member"
- [ ] (v1.1 revision) Push to main → Netlify auto-deploys

## Refusal test record
None yet. Filled by Claude Code at half A and by the builder at half B: date, who, cell tried, result. Kept, never cleared; any change to a rule re-runs both halves before the push.

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

## Known issues
- Supabase's built-in email sender is rate-limited and (on the default setup) only delivers to Supabase org/project team addresses — a colleague outside the org may never receive a reset or invite email. Not tested with a real inbox.
- The Auth Site URL / Redirect URL settings are project-wide, shared with the Supplier Engagement Portal (which uses no Auth) — only ADD entries, never remove existing ones.
- Setting a Netlify env var with `envVarIsSecret: true` via the Netlify MCP tool silently fails to persist the value — always set without that flag, then verify with getAllEnvVars, and always redeploy after any env var change.
- Netlify MCP not activated for this repo — deploys happen via GitHub push, env vars are set manually.
- Brand colors provisional (#F7F8FA background, #14213D accent/text) — confirm before first deployment.
- Supabase project is on the Free plan, shared by two tools — pauses after ~1 week of no traffic, taking both tools offline together. Builder aware, staying on Free for now.
- Reviewer and User roles have no real named holder yet — placeholders in use (see Build decisions); re-run the refusal test as real people once invited.
- Spec revised to v1.1 on 2026-09-23 — CLAUDE.md regenerated by Project Governor on 2026-09-25.

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

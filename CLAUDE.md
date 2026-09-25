# Sustainable Suppliers Dashboard — Internal Use Only

## Identity
An internal analytics and review dashboard for The Corporate's sustainability team, reading submissions already collected by the public Supplier Engagement Portal, accessed with a username and password. Three distinct roles (Administrator, Reviewer, User) see and can do different things.
Tier: 3 — login required, data persists to Supabase, different roles have different permissions (D3+A3)
Spec version governed: v1.1 — the version of docs/product-spec.md these rules were derived from.
Position: Tool 2 of 2 in the AI Lab project supplier portal stack — shares the Supabase project with Supplier Engagement Portal; this tool builds on the existing schema, it does not create it. This tool's docs/access-matrix.md and docs/user-stories.md are its own (not copies) — the Portal has no login and no business role of its own.

## Session Protocol
At the start of every session:
1. Pull the latest from main before reading anything else.
2. Check docs/product-spec.md: if its version is newer than the "Spec version governed" line in this file, STOP. Tell the builder: "The spec has changed since this CLAUDE.md was written — re-run the Project Governor on the revised spec before building, or these rules may contradict it." Do not build against a stale CLAUDE.md.
3. Read PROGRESS.md in the project root — it is the current state of this build. If it is missing, recreate it with the structure at the end of this section, then continue.
4. Increment the session number and update the date in PROGRESS.md.
5. If "Notes for next session" has content: repeat the notes back to the builder, treat them as this session's priorities, then clear the section.
6. If this is session 1, run First Session Setup below before any build work.

Save point — after completing any module, feature, fix, or schema change:
1. Update PROGRESS.md: current state, remaining work, build decisions, known issues.
2. If the database was touched (any table, policy, bucket, or auth change), update docs/supabase-setup.md in the same save point, and make sure the change's migration file is in supabase/migrations/ and committed with it.
3. Commit and push to main.
4. Tell the builder in one line: "Save point committed: [what changed]."
Do not start the next piece of work before the save point is pushed. Never end a session without one — an ending session is a save point.

First Session Setup (already done in session 1 — kept here in case the repo is ever rebuilt from scratch): create docs/ and move product-spec.md, access-matrix.md, user-stories.md, supabase-setup.md and supabase-setup-portal.md (the sibling tool's schema, renamed to distinguish it) into it; confirm every file is present before building anything; announce what moved, then commit and push.

PROGRESS.md structure (for the recreate rule): status header (Session / Last updated / Live URL / Stage / Supabase project), Current state, Last session (3–5 lines, replace each session), Remaining work (shrinking checklist), Build decisions (one line each), Known issues, Backlog, Notes for next session.

## Commands
```
npx serve .
```

## Tech Stack
HTML · CSS · JavaScript · Netlify · Supabase
Deployment: GitHub push to main → Netlify auto-deploys from main. Netlify MCP is not active for this repo — env vars are entered manually in the Netlify dashboard. Plain HTML/JS (no Vite): SUPABASE_URL and SUPABASE_ANON_KEY are served to the browser at runtime via a config-serving Netlify Function (public-config.js), never baked in at build time — a permanent decision from session 1 (no local Node.js/npm to test a Vite build).

## Environment Variables
SUPABASE_URL — Supabase: Project Settings → API Keys → Project URL — Netlify env var, served to the browser at runtime via public-config.js
SUPABASE_ANON_KEY — Supabase: Project Settings → API Keys → publishable/anon key — Netlify env var, served the same way as SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY — Supabase: Project Settings → API Keys → service_role/secret key — Netlify env var, server-side only. Used inside Netlify Functions to (a) verify the caller's session before returning a signed file URL, and (b) — new in v1.1 — list every invited Supabase Auth account for Manage Users, gated on the caller's own `user_roles.role = administrator`. Never sent to the browser.

Key storage follows function placement: Netlify Functions and the frontend read Netlify environment variables. No value ever appears in code or in any file committed to GitHub. The variable NAMES above are fixed; only the underlying key values may change on rotation, a builder task, not a code change.

## Supabase
Project: "AI Lab project supplier portal" — already exists (ref `yfshmobaatyruymcpbex`, URL https://yfshmobaatyruymcpbex.supabase.co). docs/supabase-setup-portal.md documents the sibling Supplier Engagement Portal's part of the schema — read it before any database work; never recreate or modify anything it describes. docs/supabase-setup.md is this tool's own schema source of truth — read it first, update it at every save point that touches the database.
Plan: Free — builder confirmed staying on Free for now; the project pauses after ~1 week of no traffic, affecting both tools sharing it (Known Issues).
Population pattern: P2 — internal only, for this tool's own tables (`submission_reviews`, `user_roles`); no anon access to either. The three sibling-owned tables keep their existing anon rules, owned by the Portal and documented, never redefined here — see docs/access-matrix.md Section 1.

Tables this tool reads (already exist — never modify): `respondents` (company_name, contact_name, contact_email, door_type, status, created_at, updated_at), `ecovadis_submissions` (respondent_id FK, file_url, uploaded_at), `questionnaire_submissions` (respondent_id FK, mode, file_url, responses jsonb, updated_at).

Tables this tool owns: `submission_reviews` (built v1.0, unchanged shape: respondent_id FK to respondents unique, review_status enum new_to_be_analysed/need_review/final_submission default new_to_be_analysed, updated_at). `user_roles` (new v1.1: user_id uuid FK to auth.users unique not null, role enum administrator/reviewer/user not null no default — no row means no role, updated_at timestamptz default now()).

There is no `profiles` table in this tool — identity is `auth.users` (email, id) plus `user_roles` (role). Deliberate deviation from the framework's default profiles pattern, confirmed in docs/access-matrix.md Section 3.

RLS — every rule below is lifted from docs/access-matrix.md; build each with the mechanism its policy plan names, never from memory:
- `submission_reviews`: read = every authenticated caller (Administrator, Reviewer, User, no role); create/update = Administrator or Reviewer only, via a role-check helper reading the caller's row in `user_roles`; no delete for anyone; no anon access (write access moves from v1.0's unconditional `using (true)` to role-gated).
- `user_roles`: read = own row only for Reviewer/User/no role; all rows for Administrator; create/update = Administrator only, for any row including their own (a single Administrator must be able to change their own row — blocking self-edit risks a lockout only the Supabase dashboard could recover from); no delete for anyone; no anon access.
- `respondents`, `ecovadis_submissions`, `questionnaire_submissions`: unchanged from v1.0 — read = every authenticated caller regardless of role; no write of any kind from this tool; anon rules untouched, owned by the sibling tool.

Auth, as built: email and password, admin-managed — unchanged from v1.0. Sign-ups off; the Administrator invites each team member in the Supabase dashboard (Authentication → Users → Invite), then assigns their role via Manage Users. Forgot-password (added v1.0) is unaffected and works for every role. New in v1.1: nobody can write their own `user_roles` row except an Administrator writing their own.

Roles: `administrator`, `reviewer`, `user` — stored in `user_roles.role`, exactly as spelled. No row in `user_roles` = "no role": the app treats this as read-only, identical to User — never a crash, never an implicit admin grant (product-spec.md Section 9).

File access: unchanged from v1.0 — the `submissions` Storage bucket (owned by the sibling tool) grants authenticated users no direct read access. Supplier Detail generates short-lived signed URLs server-side via `signed-file-url.js`, using `SUPABASE_SERVICE_ROLE_KEY`, after verifying the caller's session.

New in v1.1: Manage Users' account listing reads `auth.users`, only available server-side with the service role key — a new Netlify Function extending the `signed-file-url.js` pattern, gated so it only returns data when the caller's own `user_roles.role = administrator`.

After setup, update docs/supabase-setup.md to add the `user_roles` table, its RLS policies, the new Manage Users function and the role-check helper, following its existing structure.

## Hard Rules
- The refusal happens in the database (RLS) or in a server function holding the service role key (the Manage Users listing), never only in the screen. RLS stays enabled on every table, including `user_roles`, and is never disabled to make something work. `anon` has no policy and no table grant on `submission_reviews` or `user_roles`.
- No Reviewer, User or no-role account can change any row in `user_roles`, including their own — a policy refuses every write from a non-Administrator. An Administrator may change any row, including their own, deliberately (see Supabase section above).
- Neither `submission_reviews` nor `user_roles` has a frozen or final row — both stay editable by whoever the matrix grants write to. Explicit deviation from the general "final state is frozen" default: there is no document here to freeze.
- Nothing is deleted through the app. No `DELETE` policy exists on `submission_reviews` or `user_roles`. Access is removed by changing a role (or leaving an account at "no role"), never by deleting its row; removing a person's Supabase Auth account entirely is a manual, out-of-app action, accepted for this version.
- `submission_reviews` and `user_roles` both carry `updated_at`; neither carries `created_by` — neither table has per-row ownership, write access is controlled by role membership.
- API keys never in any frontend file or GitHub commit. `SUPABASE_URL`/`SUPABASE_ANON_KEY` served to the browser only via public-config.js; `SUPABASE_SERVICE_ROLE_KEY` only ever read inside a server-side Netlify Function.
- Netlify Identity: never. Supabase Auth is the only authentication system in this stack.
- Migrations: every schema, policy, trigger and function change goes through `apply_migration` with a descriptive name and is saved as a file in supabase/migrations/, committed with the save point; `execute_sql` is for reads and data fixes only.
- Function contract: every database function is SECURITY INVOKER unless it must write a protected column or read on behalf of a policy; the role-check helper is SECURITY DEFINER with `SET search_path = ''`, checks `auth.uid()` first. Every RPC: `REVOKE EXECUTE FROM public, anon; GRANT EXECUTE TO authenticated`.
- Supabase service role key required for (a) signed URLs to view uploaded files, and (b) listing invited accounts for Manage Users — both server-side only, verifying the caller's session (and, for Manage Users, their Administrator role) before returning anything.
- This tool shares a Supabase project with Supplier Engagement Portal. Protected tables — `respondents`, `ecovadis_submissions`, `questionnaire_submissions`, and the `submissions` bucket — must never have their existing schema, anon policies, or grants modified or removed. This tool may only ADD authenticated-role SELECT policies on those tables (done in v1.0) and manage `submission_reviews`/`user_roles` freely.
- Complexity: build no rate limit, queue, retry, scan, monitor or test suite.
- GDPR: not applicable (product-spec.md Section 7) — `user_roles` adds no new personal data beyond an existing `auth.users` id.

## Project Structure
```
/                     ← root: CLAUDE.md, PROGRESS.md, index.html (login + forgot-password), reset-password.html, dashboard.html (main app, incl. Manage Users)
/netlify/functions    ← public-config.js, signed-file-url.js, list-users.js (new v1.1 — Manage Users listing, service-role-backed, Administrator-gated)
/docs                 ← product-spec.md, supabase-setup.md, supabase-setup-portal.md, access-matrix.md, user-stories.md
```

## Brand
No brand skill yet. These inline rules apply until one is added to the repo (then install it per First Session Setup and defer to it):
- Background: #F7F8FA · Accent/Text: #14213D · Font: Inter (clean default)
- Clean and minimal — deliberately different from the black/white Supplier Engagement Portal

## Business Rules
- Red flag (Red Flags view, questionnaire respondents only): `pfas_present = "Yes"`, OR `sbti_target = "No"`, OR `high_water_stress_region = "Yes"`, OR any field in `questionnaire_submissions.responses = "Not Available"` (literal string match).
- Home/Summary counts: EcoVadis-complete = respondents where door_type=ecovadis and status=complete; Questionnaire-complete = respondents where door_type=questionnaire and status=complete; in-progress = respondents where status=in_progress; need-review = submission_reviews where review_status=need_review.
- `review_status` defaults to `new_to_be_analysed` on first view of a supplier with no review row; editable inline (Suppliers Table, Supplier Detail) only for Administrator and Reviewer.
- EcoVadis-only respondents never appear in Red Flags.
- Role-based rendering: Administrator sees and uses everything, including Manage Users. Reviewer sees everything except Manage Users. User sees everything except Manage Users; Review Status renders as read-only text. No role (invited, not yet assigned): treated as User for viewing, cannot edit anything, cannot see Manage Users.
- A role change by the Administrator does not force out an already-open session; it applies on that person's next page load.

Out of scope — do not build:
- Editing the supplier's original submission data — this tool is read-only on that data
- CSV/data export, email alerts on new red flags or submissions, AI-generated summaries, scheduled automation
- In-app invitation of new users — inviting stays a Supabase-dashboard action; Manage Users only assigns roles to already-invited accounts
- Restricting which suppliers a role can see — all roles see all suppliers

## Reference Docs
Read before building the related part:
- docs/product-spec.md — full module specs, UI sections, logic, arm detail
- docs/supabase-setup.md — this tool's schema source of truth, updated every save point that touches the database
- docs/supabase-setup-portal.md — the sibling tool's schema (read-only reference — never edit)
- docs/access-matrix.md — read before writing any RLS or touching a policy; every policy is built from it (full form: roles, ownership, the policy plan)
- docs/user-stories.md — read before changing a screen or a role; every acceptance line is a test
PROGRESS.md in the root is read at every session start per the Session Protocol.

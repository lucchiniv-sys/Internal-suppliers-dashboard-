# Product Spec — Sustainable Suppliers Dashboard — Internal Use Only

**Version:** 1.1
**Date:** 2026-09-23
**Author:** Valentina
**Status:** Confirmed

> **Template note (v1.1):** the product-spec-template.md reference has been substantially updated since v1.0 was written (it now assumes a separate "Access Architect" skill producing `access-matrix.md`/`user-stories.md` for every D3 tool, plus a three-stage fixture-data-first build path for new Tier 3 tools). Neither is available in this session, and this tool is already live, not a new build. The template explicitly provides for this: "Only for a single-run build with no Access Architect: replace this note with the old per-table, per-role read/insert/update/delete grid." Section 6 below uses that fallback. Section 14's build path is written for iterating an already-live tool, not the three-stage new-build path.

---

## Section 1 — Tool Summary

**Tool name:** Sustainable Suppliers Dashboard — Internal Use Only

**What it does:** An internal analytics and review dashboard for The Corporate's sustainability team. It reads the submissions already collected by the public Supplier Engagement Portal (EcoVadis scorecards and sustainability questionnaires) and presents a summary (with a submissions-by-type pie chart), a red-flags view, and a searchable table of every respondent with a drill-down detail view. Team members can set a manual review status on each supplier. As of v1.1, different team members have different permissions, and an Administrator can manage who has which permission level.

**Who uses it:** The Corporate's sustainability team members — internal staff only, logging in with a username and password. As of v1.1, three distinct roles: Administrator, Reviewer, and User (read-only).

**Why it exists:** The team currently has no way to see who has responded, what the answers say, or which suppliers need attention, without querying the database directly. This dashboard gives them a working view without touching the supplier-facing portal at all.

**Build status:** Iteration. v1.0 (2026-09-16) was a first build with a single access level — every logged-in team member could read and edit everything (a chosen A2 tool). v1.0 also added, mid-build, a submissions-by-type pie chart, a two-page Summary/Details split, and a forgot-password flow — all live and unchanged by this revision. v1.1 changes the access model from A2 to A3: three named roles with different permissions, plus a new in-app "Manage Users" screen (Administrator-only) to assign roles. It remains the second tool in a stack — it shares the Supabase project already created for "Supplier Engagement Portal" (Tier 2, already built and live) but is a fully separate tool with its own repo, its own CLAUDE.md, and its own Netlify site.

---

## Section 2 — Classification

### Data Model

**Decision:** D3 — Persisted (unchanged from v1.0)

| Label | What it means | This tool? |
|-------|--------------|-----------|
| D1 — Hardcoded | All data is written into the code by the developer. Users cannot input anything that persists. The tool displays what the developer put in. | No |
| D2 — Session | Data enters the tool during use and disappears when the tab closes. No database. | No |
| D3 — Persisted | Data is written to a database and survives after the session ends. Supabase is required. | Yes |

**Reason:** This tool reads submission data that already persists in Supabase (created by the sibling portal), and it writes its own new data — a review status per supplier, and now a role per team member — that must survive between sessions and be visible to the whole team.

**D3 triggers checked:**
- [x] Data must be retrievable after the session ends
- [x] Multiple sessions contribute to the same dataset (any team member can set/see review status; roles are shared state)
- [ ] An audit trail or history is needed
- [x] Data submitted by one person must be visible to another (review status set by one team member is visible to all; a role assigned by the Administrator applies to everyone's view of that person)
- [ ] Results must be accessible via a URL after the session ends
- [x] Files uploaded by users must be stored and retrievable later (already true of the underlying supplier data this tool reads)

---

### Access Model

**Decision:** A3 — Authorization (changed from A2 in v1.0)

| Label | What it means | This tool? |
|-------|--------------|-----------|
| A1 — Public | Anyone with the URL can use it. No login. | No |
| A2 — Authentication | Users must log in. All logged-in users see the same thing and have the same permissions. Admin work happens in the Supabase dashboard, not in the app. | No — true in v1.0, no longer true |
| A3 — Authorization | Users must log in and have different roles. Different roles see different data or have different permissions. | Yes |

**Reason:** v1.1 adds an in-app admin action — assigning roles from a "Manage Users" screen inside the tool — and two roles with genuinely different permissions (Reviewer/Administrator can edit; User cannot). Per the template's own rule, the moment one logged-in person has an admin action in the app, the tool is A3.

> **Promotion rule:** Auth requires a database. Since Access Model is A3, the Data Model is D3 — confirmed above (was already true under A2).

---

### Access Model is A3 — define all roles

| Role name | Who this is | Named first holder (name, work email) | What they can see | What they can do |
|-----------|------------|----------------------------------------|-------------------|-----------------|
| Administrator | Runs the tool and the team's access to it | Valentina Lucchini, lucchini.v@gmail.com | Everything: Summary, Red Flags, Suppliers Table, Supplier Detail, Manage Users | Everything a Reviewer can do, plus: assign or change any team member's role from the Manage Users screen |
| Reviewer | A sustainability team member who actively works the data | Not yet named — no second team member invited yet; see Section 15 | Everything except Manage Users: Summary, Red Flags, Suppliers Table, Supplier Detail | Change a supplier's Review Status (table or detail view) |
| User | A sustainability team member who only needs to consult the data | Not yet named — no second team member invited yet; see Section 15 | Everything except Manage Users: Summary, Red Flags, Suppliers Table, Supplier Detail | View only — Review Status shows as plain text, not an editable control |

> Administrator and Reviewer have identical data permissions in this version (both can edit Review Status); Administrator's only distinguishing capability is Manage Users. This is deliberate — see Section 15.

---

### Tier

**Tier:** 3 (D3 + A3) — unchanged tier, changed A-side classification

| Tier | D+A combination | Stack | Deployment |
|------|----------------|-------|------------|
| 3 | D3+A2 or D3+A3 | Netlify + Supabase (auth + RLS) | Netlify |

---

### Standalone or Stack

**This tool is:** Part of a stack — see Section 4. It shares the "AI Lab project supplier portal" Supabase project with the already-built "Supplier Engagement Portal" (Tier 2), but does not share a repo, CLAUDE.md, or Netlify site. Unchanged from v1.0.

---

## Section 3 — Arms

Unchanged from v1.0 — no arms active.

### AI API Arm
**Active:** No

### Export Arm
**Active:** No — explicitly deferred (see Section 12).

### Email Arm
**Active:** No — explicitly deferred (see Section 12).

### Scheduled Automation Arm
**Active:** No

---

## Section 4 — Stack and Deployment

Unchanged from v1.0 — recorded here as actually built and live, since the current template's defaults (React+Vite, the Supabase Netlify extension) do not describe this tool's real, working setup.

### All Tiers

| Detail | Answer |
|--------|--------|
| Frontend framework | HTML/CSS/JS — chosen during the v1.0 build session because the build environment had no Node.js/npm available to test a React+Vite build locally before deploying; matches the sibling Supplier Engagement Portal's stack |
| Deployment target | Netlify |
| Deployment | GitHub push to main → Netlify auto-deploy. The Netlify site ("miadb") is connected to this tool's GitHub repo (Internal-suppliers-dashboard-). Supabase credentials are set as plain Netlify environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) via the Netlify API/MCP, not via the Supabase Netlify extension — the extension was not used for this tool. |
| Platform owner | The builder (Valentina) personally holds the Netlify and Supabase accounts this tool runs on. |

**GitHub:** Existing repo (Internal-suppliers-dashboard-), created for v1.0. This is an iteration — no new repo.

---

### Supabase project — Tier 3

**Supabase project status:** Existing — this tool connects to the same project as "Supplier Engagement Portal". Unchanged from v1.0.

**Supabase plan:** Free — confirmed by the builder in v1.0 and unchanged. The project pauses after roughly a week of no traffic; this affects both tools sharing it. Still flagged as an open item (Section 15).

| Detail | Answer |
|--------|--------|
| Project name | AI Lab project supplier portal (also referred to as "the-corporate-sustainability") |
| Project ID | yfshmobaatyruymcpbex |
| supabase-setup.md location | This tool's own docs/supabase-setup.md (created in v1.0, updated at every save point that touches the database) plus docs/supabase-setup-portal.md, a copy of the sibling tool's schema file, kept in this repo for reference. |

> Claude Code will read both files before making any schema changes, and will only ever ADD to the shared schema — it must never modify or remove any existing table, policy, or grant that the Supplier Engagement Portal depends on for its anon (public, no-login) users, nor anything v1.0 of this tool already added for the `authenticated` role.

---

### This tool is part of a stack

Unchanged from v1.0.

**Stack name / Supabase project name:** AI Lab project supplier portal (yfshmobaatyruymcpbex)

**This tool's role in the stack:** Tool B — internal review and analytics dashboard.

**Other tools in this stack:**

| Tool | Tier | Role in the stack |
|------|------|------------------|
| Supplier Engagement Portal | Tier 2 | Public-facing submission tool (EcoVadis upload, questionnaire) — already built and live. Created the shared schema. |
| Sustainable Suppliers Dashboard — Internal Use Only | Tier 3 | This tool. |

> **Build order:** unchanged — the Supplier Engagement Portal already created the schema; this tool only ever adds to it.

---

## Section 5 — Data Architecture

**v1.0 tables (unchanged, already live):**

| Table name | What it stores | Key fields |
|-----------|---------------|-----------|
| submission_reviews | One row per supplier (respondent), tracking this dashboard's own review status | respondent_id (FK, unique), review_status, updated_at |

**New in v1.1 — what data is collected or stored:**

| Field name | Plain language label | Data type | Who provides it | Required? |
|-----------|---------------------|-----------|----------------|-----------|
| user_id | Which team member this role belongs to | UUID, FK to auth.users, unique | Automatic (set when the Administrator assigns a role) | Yes |
| role | The team member's role | Text (enum: administrator / reviewer / user) | Administrator, via the Manage Users screen | Yes — no default; a newly invited person has no row until the Administrator assigns one |
| updated_at | Last time the role changed | Timestamp | Automatic | Yes |

**New table needed:**

| Table name | What it stores | Key fields |
|-----------|---------------|-----------|
| user_roles | One row per team member with an assigned role | user_id (FK to auth.users, unique), role, updated_at |

> A person invited via Supabase but not yet given a row in `user_roles` has no role. The app should treat "no role" as "no access beyond signing in" — see Section 6 and Section 9 for how the app should handle this case; it must not default a roleless account to any permission level.

**Existing data this tool READS but does not own or modify (unchanged from v1.0):**
- `respondents`, `ecovadis_submissions`, `questionnaire_submissions` — see docs/supabase-setup-portal.md for full field lists.

**File storage:** Unchanged from v1.0 — no new buckets; this tool still only reads the existing `submissions` bucket via signed URLs.

**Derived or calculated data:** Unchanged from v1.0 (Summary counts, Red Flags) — see the v1.0 description, still accurate. New in v1.1: the app derives "which screens and controls to show" from the signed-in user's row in `user_roles` (Administrator/Reviewer see everything and can edit; User sees everything read-only; no role means no access to any data screen).

---

## Section 6 — Access and Permissions

> **No Access Architect run for this iteration** (skill not available this session) — using the template's own single-run fallback: the old per-table, per-role grid, in place of a pointer to `access-matrix.md`.

**Auth configuration:**

| Detail | Answer |
|--------|--------|
| Login, as built | Email and password, admin-managed — unchanged from v1.0. Supabase Auth: sign-ups off, the Administrator creates/invites each user directly in the Supabase dashboard (unchanged — Manage Users does NOT invite people, only assigns a role to an already-invited account, per the builder's explicit choice). Forgot-password flow (added in v1.0) is unaffected by this change and continues to work for every role. |
| Named first holders | Administrator — Valentina Lucchini, lucchini.v@gmail.com (the only account that exists today). Reviewer and User — not yet named; see Section 15. |
| Signup model | Invite-only by construction (sign-ups off; the Administrator invites via the Supabase dashboard, then assigns a role via Manage Users). Unchanged from v1.0's stated intent, now with the role step made explicit and in-app. |

> **Privacy note:** User accounts store team members' email addresses; this falls under The Corporate's existing internal privacy framework, not a public consent flow. Unchanged from v1.0.

**Roles — plain language:**

| Role | What they broadly see and do |
|------|------------------------------|
| Administrator | Everything Reviewer can do, plus: open Manage Users and assign/change any team member's role |
| Reviewer | Read and edit everything supplier-related (Summary, Red Flags, Suppliers Table, Detail, Review Status) |
| User | Read everything supplier-related; cannot edit Review Status or anything else |

**RLS rules — the full grid (single-run fallback, no Access Architect):**

| Table | User type | Can read | Can insert | Can update | Can delete |
|-------|----------|----------|------------|------------|------------|
| respondents | anon (unchanged, owned by the sibling tool) | No | No | No | No |
| respondents | authenticated (any role, including no role) | All rows | No | No | No |
| ecovadis_submissions | anon (unchanged) | No | Yes (unchanged) | No | No |
| ecovadis_submissions | authenticated (any role) | All rows | No | No | No |
| questionnaire_submissions | anon (unchanged) | No | Yes/Yes (unchanged) | — | No |
| questionnaire_submissions | authenticated (any role) | All rows | No | No | No |
| submission_reviews | anon | No | No | No | No |
| submission_reviews | authenticated, role = Administrator or Reviewer | All rows | Yes | Yes | No |
| submission_reviews | authenticated, role = User or no role | All rows | No | No | No |
| user_roles | anon | No | No | No | No |
| user_roles | authenticated, own row | Own row only | No | No | No |
| user_roles | authenticated, role = Administrator | All rows | Yes | Yes | No |
| user_roles | authenticated, role = Reviewer or User | No rows but their own | No | No | No |

> **Critical constraint (unchanged from v1.0, still applies):** the "anon (unchanged)" rows above are owned by the Supplier Engagement Portal and must never be touched. This tool only ever ADDS to the schema. Claude Code must verify, after making changes, that the sibling tool's public flow still works exactly as before, and that v1.0's existing `submission_reviews` behavior for Administrator/Reviewer matches what was already live (only the User-role restriction and the new `user_roles` table are new).

---

## Section 7 — GDPR

**GDPR outcome:** Not applicable — unchanged from v1.0.

The new `user_roles` table stores no new personal data — it tags an already-invited account (identified by its existing `auth.users` id) with an internal role label. This tool's own forms still collect no personal data from external parties. See v1.0's Section 7 reasoning for the rest, unchanged.

---

## Section 8 — Screen and UI Structure

**Unchanged from v1.0:** Login, Home/Summary (including the v1.0 pie chart and the two-page Summary/Details navigation), Red Flags, Supplier Detail. See v1.0 for their full description — still accurate except for the Review Status control behavior noted below.

**Changed in v1.1:**

### Suppliers Table
- **What is visible / User actions:** unchanged from v1.0, EXCEPT the Review Status control: for Administrator and Reviewer it is still an editable dropdown; for User it displays as plain, non-interactive text.

### Supplier Detail
- Same change as above: Review Status is editable for Administrator/Reviewer, read-only text for User.

**New in v1.1:**

### Manage Users
- **Purpose:** Let the Administrator see who has access and assign or change their role.
- **What is visible:** A list of every invited team member (email address, from `auth.users`) with their current role (or "No role assigned" if none yet); a role selector per row (Administrator / Reviewer / User).
- **User actions:** Change a person's role via the selector. Visible and reachable only when signed in as Administrator — not shown at all, and not reachable by URL, for Reviewer or User.
- **What happens next:** The change saves immediately to `user_roles`. The affected person's permissions in the rest of the app take effect the next time they load a page (not live-pushed to an open session).
- **Technical note for Claude Code:** listing every invited account (not just those with an assigned role already) requires reading `auth.users`, which is only available server-side with the service role key — this needs a Netlify Function (matching the pattern already used for `signed-file-url.js`), gated so it only returns data when the caller's own `user_roles` row says Administrator.

---

## Section 9 — Logic and Calculations

**Unchanged from v1.0:** Summary counts, Red Flags determination — see v1.0's Section 9, still accurate.

**New in v1.1 — role-based UI logic:**

**What is calculated:** which screens and controls the signed-in user sees.

**Inputs:** the signed-in user's row in `user_roles` (or its absence).

**Rules:**
- Administrator: see and use everything, including Manage Users.
- Reviewer: see and use everything except Manage Users (not shown, not reachable).
- User: see everything except Manage Users; Review Status renders as read-only text, not a control.
- No row in `user_roles` (invited via Supabase but not yet assigned a role): treated as User for viewing (so the account isn't fully locked out the moment it's invited) but cannot edit anything and cannot see Manage Users. The Administrator should assign a real role promptly after inviting someone.

**Output:** the app conditionally renders navigation and controls based on the above.

**Edge cases:** A role change made by the Administrator does not need to force out an already-logged-in session; it applies on that person's next page load. Deleting a person's Supabase account (not built as a feature, done manually if ever needed) would orphan their `user_roles` row — acceptable for this version, not cleaned up automatically.

---

## Section 10 — Brand and Visual Direction

Unchanged from v1.0. Background #F7F8FA, accent/text #14213D, Inter font, clean and minimal — see v1.0 for full detail.

---

## Section 11 — API and Credentials

Unchanged from v1.0 — no new external services. The Manage Users screen's server-side listing (Section 8) uses the same `SUPABASE_SERVICE_ROLE_KEY` already in place for `signed-file-url.js`; no new credential is required.

| Service | What it does in this tool | Key required | Where key is stored |
|---------|--------------------------|-------------|-------------------|
| Supabase | Database (existing tables + submission_reviews + new user_roles), Auth (team login, now role-aware), file access (signed URLs), and now: listing invited accounts for Manage Users | Anon/publishable key (browser-safe) + Service role key (server-side only) | Netlify environment variables (already set: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) |

**Credentials readiness:** Already available and already configured in Netlify — nothing new to create for this iteration.

---

## Section 12 — Out of Scope — Phase 2

| Deferred feature | Reason it is deferred |
|-----------------|----------------------|
| In-app invitation of new users | The builder chose to keep inviting via the Supabase dashboard directly; Manage Users only assigns roles to already-invited accounts |
| Restricting which suppliers a role can see | All roles see all suppliers in this version; not requested |
| Formal Access Architect run / access-matrix.md / user-stories.md | Skill not available this session; using the template's single-run RLS-grid fallback instead (Section 6) |
| Editing the supplier's original submission data | Unchanged from v1.0 — this tool remains read-only on the portal's own data |
| CSV/data export, email alerts, AI summaries, scheduled automation | Unchanged from v1.0 — not needed for this version |

---

## Section 13 — Acceptance Criteria

**v1.0 criteria (unchanged, still must hold):** login gate, Summary counts correct, Red Flags accuracy, Suppliers Table search, Review Status persists, Detail view accuracy, sibling portal untouched, GDPR confirmation, live deployment. See v1.0 for full wording.

**New for v1.1:**

| # | What to verify | Expected result | Done? |
|---|---------------|-----------------|-------|
| 10 | Administrator sees Manage Users | Manage Users appears in navigation and is reachable; lists every invited account with its current role or "No role assigned" | [ ] |
| 11 | Reviewer and User do not see Manage Users | Not shown in navigation; directly loading its URL does not reveal any user data | [ ] |
| 12 | Role assignment works and persists | Administrator changes a person's role; the change is saved and visible on reload, by any Administrator | [ ] |
| 13 | Reviewer permissions match v1.0 behavior | Reviewer can view everything and edit Review Status, identical to v1.0's single access level | [ ] |
| 14 | User is read-only | User sees all data but Review Status renders as text, not a control; attempting to change it via a direct API call is refused by RLS, not just hidden in the UI | [ ] |
| 15 | No-role account is safely restricted | A newly invited account with no `user_roles` row can sign in but cannot edit anything and cannot see Manage Users | [ ] |
| 16 | Sibling portal and v1.0 features unaffected | Supplier Engagement Portal's public flow, and this tool's Summary/pie chart/Red Flags/forgot-password, all work exactly as before | [ ] |

---

## Section 14 — Build Path

**This tool's tier:** Tier 3

> This is an iteration on an already-live Tier 3 tool, not a new build — the three-stage fixture-data-first path in the current template (Section 14) describes standing up Auth and RLS for the first time on a brand-new tool. That already happened for this tool in v1.0. This iteration adds one table, extends RLS, and adds one screen, directly, verified live the same way every other change to this tool has been.

### Pre-build steps
- [ ] Tool Architect skill — interview complete, this spec confirmed
- [ ] Project Governor skill (Iteration Mode) — CLAUDE.md regenerated, PROGRESS.md's live state preserved and the new work appended
- [ ] Updated product-spec.md, CLAUDE.md, PROGRESS.md pushed to the existing repo (Internal-suppliers-dashboard-)

### Build session
- [ ] Claude Code reads the updated product-spec.md, CLAUDE.md, PROGRESS.md, and both supabase-setup.md files (this tool's own, and the sibling's)
- [ ] Connects to the existing Supabase project; reviews current schema before making any changes
- [ ] Adds the `user_roles` table and its RLS policies (Section 6), without touching any existing table, policy, or grant
- [ ] Builds the server-side user-listing function for Manage Users (service-role-backed, gated to Administrator)
- [ ] Builds the Manage Users screen, and the role-based conditional rendering (Section 9) across the existing screens
- [ ] Updates this tool's docs/supabase-setup.md with the new table and policies
- [ ] Local/live test pass — verify every new acceptance criterion (Section 13, #10–16) plus a spot-check of the unchanged v1.0 criteria
- [ ] Push to main → Netlify auto-deploys (existing site "miadb")

---

## Section 15 — Open Questions

| Question | Who answers it | Blocking? |
|----------|---------------|-----------|
| Reviewer and User roles have no named first holder yet — no second team member has been invited | Builder | No — the schema and screens don't need a real second person to be built and tested; the builder can invite and assign roles whenever she's ready |
| Stay on Supabase Free plan or upgrade to Pro (carried over from v1.0, unresolved) | Builder | No |
| Exact brand hex colors — still provisional (carried over from v1.0) | Builder | No |

---

## Section 16 — Tool Version History

| Version | Date | What changed in the tool |
|---------|------|--------------------------|
| v1.0 | 2026-09-16 | Initial build: login, Summary, Red Flags, Suppliers Table, Supplier Detail, single access level (A2). Same-session additions: submissions-by-type pie chart, two-page Summary/Details navigation, forgot-password flow. |
| v1.1 | 2026-09-23 | Access model changed from A2 to A3: three roles (Administrator, Reviewer, User) with different permissions; new Manage Users screen (Administrator-only) to assign roles to already-invited accounts; Review Status becomes read-only for the User role. |

---

*This spec is written for Claude Code. It assumes zero prior context.*

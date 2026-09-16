# Product Spec — Sustainable Suppliers Dashboard — Internal Use Only

**Version:** 1.0
**Date:** 2026-09-15
**Author:** Valentina
**Status:** Confirmed

---

## Section 1 — Tool Summary

**Tool name:** Sustainable Suppliers Dashboard — Internal Use Only

**What it does:** An internal analytics and review dashboard for The Corporate's sustainability team. It reads the submissions already collected by the public Supplier Engagement Portal (EcoVadis scorecards and sustainability questionnaires) and presents a summary, a red-flags view, and a searchable table of every respondent with a drill-down detail view. The team can also set a manual review status on each supplier.

**Who uses it:** The Corporate's sustainability team members — internal staff only, logging in with a username and password.

**Why it exists:** The team currently has no way to see who has responded, what the answers say, or which suppliers need attention, without querying the database directly. This dashboard gives them a working view without touching the supplier-facing portal at all.

**Build status:** First build of this tool. It is the second tool in a stack — it shares the Supabase project already created for "Supplier Engagement Portal" (Tier 2, already built and live) but is a fully separate tool with its own repo, its own CLAUDE.md, and its own Netlify site.

---

## Section 2 — Classification

### Data Model

**Decision:** D3 — Persisted

| Label | What it means | This tool? |
|-------|--------------|-----------|
| D1 — Hardcoded | All data is written into the code by the developer. Users cannot input anything that persists. The tool displays what the developer put in. | No |
| D2 — Session | Data enters the tool during use and disappears when the tab closes. No database. | No |
| D3 — Persisted | Data is written to a database and survives after the session ends. Supabase is required. | Yes |

**Reason:** This tool reads submission data that already persists in Supabase (created by the sibling portal), and it writes its own new data — a review status per supplier — that must survive between team members' sessions and be visible to the whole team.

**D3 triggers checked:**
- [x] Data must be retrievable after the session ends
- [x] Multiple sessions contribute to the same dataset (any team member can set/see review status)
- [ ] An audit trail or history is needed
- [x] Data submitted by one person must be visible to another (review status set by one team member is visible to all)
- [ ] Results must be accessible via a URL after the session ends
- [x] Files uploaded by users must be stored and retrievable later (already true of the underlying supplier data this tool reads)

---

### Access Model

**Decision:** A2 — Authentication

| Label | What it means | This tool? |
|-------|--------------|-----------|
| A1 — Public | Anyone with the URL can use it. No login. | No |
| A2 — Authentication | Users must log in. All logged-in users see the same thing and have the same permissions. | Yes |
| A3 — Authorization | Users must log in and have different roles with different permissions. | No |

**Reason:** Only the sustainability team may see supplier submission data. All team members have identical access — there is no differentiated role.

> **Promotion rule:** Auth requires a database. Since Access Model is A2, the Data Model is D3 — confirmed above.

---

### Access Model is A2 — both questions

**Auth reason:** Controlled access — only a specific, defined list of people (the sustainability team) may use this tool.

**Signup model:** Invite-only — the builder invites specific team members through the Supabase dashboard. No open registration.

---

### Tier

**Tier:** 3 (D3 + A2)

| Tier | D+A combination | Stack | Deployment |
|------|----------------|-------|------------|
| 3 | D3+A2 or D3+A3 | Netlify + Supabase (auth + RLS) | Netlify |

---

### Standalone or Stack

**This tool is:** Part of a stack — see Section 4. It shares the "AI Lab project supplier portal" Supabase project with the already-built "Supplier Engagement Portal" (Tier 2), but does not share a repo, CLAUDE.md, or Netlify site.

---

## Section 3 — Arms

### AI API Arm
**Active:** No

### Export Arm
**Active:** No — explicitly deferred for this version (see Section 12).

### Email Arm
**Active:** No — explicitly deferred for this version (see Section 12).

### Scheduled Automation Arm
**Active:** No

---

## Section 4 — Stack and Deployment

### All Tiers

| Detail | Answer |
|--------|--------|
| Frontend framework | React + Vite + Tailwind — chosen over plain HTML/CSS/JS because this tool needs searchable/filterable tables, inline editing, and a detail drill-down view, which benefit from component structure |
| Deployment target | Netlify |
| Netlify MCP | Not decided yet — builder will confirm before the build session. If not active by then, deployment is done manually through the Netlify dashboard the first time, same as any other tool. |

**GitHub — pre-build requirement:** The builder creates a new, separate GitHub repo for this tool (never shared with the Supplier Engagement Portal's repo). product-spec.md, CLAUDE.md, and PROGRESS.md go in the repo root before the first Claude Code session.

---

### Supabase project — Tier 3

**Supabase project status:** Existing — this tool connects to the same project as "Supplier Engagement Portal". It does not create a new project.

**Supabase plan:** Free — confirmed by the builder. Note: the builder has upgraded the Netlify plan, not the Supabase plan. On the Supabase free tier, the project pauses after roughly a week of no traffic and needs manual un-pausing in the dashboard. This applies to the whole shared project, including the existing supplier-facing tool. Flagged as an open item (Section 15) in case the builder wants to reconsider once both tools are in regular use.

| Detail | Answer |
|--------|--------|
| Project name | AI Lab project supplier portal (also referred to as "the-corporate-sustainability") |
| Project ID | yfshmobaatyruymcpbex |
| supabase-setup.md location | The one already maintained in the Supplier Engagement Portal's repo (docs/supabase-setup.md). Claude Code building this new tool must be given a copy of that file, since it lives in a different repo — it will not be present in this tool's own repo automatically. |

> Claude Code will read that supabase-setup.md before making any schema changes here, and will only ever ADD to the shared schema (a new table, new RLS policies for the `authenticated` role) — it must never modify or remove any existing table, policy, or grant that the Supplier Engagement Portal depends on for its anon (public, no-login) users.

**supabase-setup.md for this tool:** Claude Code creates a NEW supabase-setup.md in this tool's own repo at the end of the first build session, documenting only what this tool added (the new table and the new RLS policies) plus a reference back to the sibling project's own supabase-setup.md for the full picture of the shared project.

---

### This tool is part of a stack

**Stack name / Supabase project name:** AI Lab project supplier portal (yfshmobaatyruymcpbex)

**This tool's role in the stack:** Tool B — internal review and analytics dashboard, read-mostly.

**Other tools in this stack:**

| Tool | Tier | Role in the stack |
|------|------|------------------|
| Supplier Engagement Portal | Tier 2 | Public-facing submission tool (EcoVadis upload, questionnaire) — already built and live. Created the shared schema. |
| Sustainable Suppliers Dashboard — Internal Use Only | Tier 3 | This tool — internal team dashboard, read access to the portal's data plus its own review-status table |

> **Build order:** the Supplier Engagement Portal already exists and already created the schema — this spec marks the Supabase project as existing. This tool's build session should not begin schema changes without first reading the existing docs/supabase-setup.md from that other repo.

---

## Section 5 — Data Architecture

**What data is collected or stored by THIS tool (new data only):**

| Field name | Plain language label | Data type | Who provides it | Required? |
|-----------|---------------------|-----------|----------------|-----------|
| respondent_id | Which supplier this review status belongs to | UUID, FK to the existing respondents table | Automatic (set when a team member first opens a supplier's row) | Yes |
| review_status | Review status | Text (enum: new_to_be_analysed / need_review / final_submission) | Team member, editable from the suppliers table or detail view | Yes — defaults to "new_to_be_analysed" |
| updated_at | Last time the review status changed | Timestamp | Automatic | Yes |

**New table needed:**

| Table name | What it stores | Key fields |
|-----------|---------------|-----------|
| submission_reviews | One row per supplier (respondent), tracking this dashboard's own review status | respondent_id (FK, unique), review_status, updated_at |

**Existing data this tool READS but does not own or modify** (already defined in the Supplier Engagement Portal's own docs/supabase-setup.md):
- `respondents` — company_name, contact_name, contact_email, door_type, status, created_at, updated_at
- `ecovadis_submissions` — respondent_id, file_url, uploaded_at
- `questionnaire_submissions` — respondent_id, mode, file_url, responses (jsonb), updated_at

**File storage:** No new file storage. This tool reads files already stored in the existing `submissions` Storage bucket (owned by the Supplier Engagement Portal) — it needs read access (e.g. via signed URLs) to let team members open a supplier's uploaded EcoVadis PDF or Excel file from the detail view, but never writes to that bucket.

**Derived or calculated data:** Yes.
- **Summary counts** (Home view): count of respondents where door_type = ecovadis and status = complete; count of respondents where door_type = questionnaire and status = complete; count of respondents where status = in_progress; count of submission_reviews where review_status = need_review.
- **Red flags** (Red Flags view): a questionnaire respondent (status = complete, mode = online) is flagged if ANY of the following is true in their `questionnaire_submissions.responses`: `pfas_present` = "Yes"; `sbti_target` = "No"; `high_water_stress_region` = "Yes"; OR any answered field in `responses` has the literal value "Not Available". Each flagged supplier's view should indicate which specific rule(s) triggered.

---

## Section 6 — Access and Permissions

**Auth configuration:**

| Detail | Answer |
|--------|--------|
| Authentication method | Email and password — explicitly requested by the builder |
| Signup model | Invite-only — builder invites specific team members via the Supabase dashboard |

> **Privacy note:** User accounts store team members' email addresses. This falls under The Corporate's existing internal privacy framework, not a public consent flow.

**RLS rules — who can read and write what:**

| Table | User type | Can read | Can insert | Can update | Can delete |
|-------|----------|----------|------------|------------|------------|
| respondents | anon (public, unchanged from the existing portal) | No | No | No | No |
| respondents | Authenticated (this dashboard's team members) | All rows | No | No | No |
| ecovadis_submissions | anon (unchanged) | No | Yes (unchanged) | No | No |
| ecovadis_submissions | Authenticated | All rows | No | No | No |
| questionnaire_submissions | anon (unchanged) | No | Yes/Yes (unchanged) | — | No |
| questionnaire_submissions | Authenticated | All rows | No | No | No |
| submission_reviews (new) | anon | No | No | No | No |
| submission_reviews (new) | Authenticated | All rows | Yes | Yes | No |

> **Critical constraint:** the "anon (unchanged)" rows above describe policies that already exist for the Supplier Engagement Portal and must not be touched. This tool only ever ADDS new SELECT policies scoped to the `authenticated` role on the three existing tables, plus full policies on its own new `submission_reviews` table. Claude Code building this tool must verify, after making changes, that the existing anon-facing supplier flow still works exactly as before.

---

## Section 7 — GDPR

**GDPR outcome:** Not applicable — confirmed during the interview.

This tool's own forms (the login) do not collect personal data from external parties — team member email addresses for an invite-only internal tool are covered by the Section 6 privacy note, not a consent flow. This tool does display personal data (company_name, contact_name, contact_email) that was already collected by the Supplier Engagement Portal; that data's own GDPR handling (consent, deletion) was already explicitly deferred in that tool's spec as a class-exercise limitation. This tool does not change that status — it adds an additional access control (login) around already-existing data rather than collecting anything new.

---

## Section 8 — Screen and UI Structure

### Login
- **Purpose:** Gate access to authorized team members only.
- **What is visible:** Email and password fields, sign-in button.
- **User actions:** Enter credentials, sign in.
- **What happens next:** On success, goes to the Home/Summary view. On failure, shows an error.

### Home / Summary
- **Purpose:** At-a-glance overview of supplier response activity.
- **What is visible:** Count of EcoVadis submitters (completed), count of Questionnaire submitters (completed), count of in-progress respondents, count of suppliers with review status "need review".
- **User actions:** View only; links/buttons to jump to the Red Flags view or the Suppliers Table.
- **What happens next:** Navigates to the selected view.

### Red Flags
- **Purpose:** Surface questionnaire respondents needing attention.
- **What is visible:** A list/table of flagged suppliers (company name, which flag(s) triggered — PFAS present / no SBTi target / high water stress region / incomplete data).
- **User actions:** Click a row to open that supplier's detail view.
- **What happens next:** Opens the Supplier Detail view for that respondent.

### Suppliers Table
- **Purpose:** Browse and search every respondent.
- **What is visible:** Search box (by company name), and a table with columns: company name, contact person, attached file indicator, submission date, review status (editable inline — dropdown with the three options).
- **User actions:** Search/filter by name, change a row's review status directly in the table, click a row to open the detail view.
- **What happens next:** Review status change saves immediately. Row click opens Supplier Detail.

### Supplier Detail
- **Purpose:** Full view of one respondent's submission.
- **What is visible:** Full identity (company name, contact name, contact email, door type, status, created/updated dates); if EcoVadis: a link to view/download the uploaded scorecard; if Questionnaire: the mode (excel_upload/online) and either a link to the uploaded Excel file or the full set of questionnaire answers organized by section; the review status, editable here too.
- **User actions:** View all data; change review status; open/download the attached file if present.
- **What happens next:** Review status change saves immediately. Back navigation returns to the Suppliers Table or Red Flags view, whichever was the entry point.

---

## Section 9 — Logic and Calculations

**What is calculated:** (1) Home view summary counts. (2) Red flag determination per questionnaire respondent.

**Inputs:** `respondents.door_type`, `respondents.status`, `questionnaire_submissions.mode`, `questionnaire_submissions.responses` (specifically the fields `pfas_present`, `sbti_target`, `high_water_stress_region`, and every other answered field for the "Not Available" check).

**Rules:**
- Summary counts: straightforward filtered counts as described in Section 5.
- Red flag: a questionnaire respondent is flagged if ANY of — `pfas_present` = "Yes"; `sbti_target` = "No"; `high_water_stress_region` = "Yes"; any field in `responses` = "Not Available" (literal string match).

**Output:** Home view shows four numbers. Red Flags view shows a filtered list with the specific triggered rule(s) shown per supplier.

**Edge cases:** A respondent with door_type = ecovadis never appears in Red Flags (the rule only applies to questionnaire responses). A questionnaire respondent still in_progress with no responses yet has nothing to flag (no responses object to check).

---

## Section 10 — Brand and Visual Direction

**Brand reference:** No brand skill file.

- **Primary colour (background):** Light — #F7F8FA (very light grey-white). Provisional; confirm exact hex before first deploy.
- **Secondary colour (text/accent):** Dark navy blue — #14213D. Provisional; confirm exact hex before first deploy.
- **Font:** Not specified — Claude Code may use a clean default (e.g. Inter).
- **Logo:** Not available.

**Visual feel:** Clean and minimal — deliberately different from the black/white Supplier Engagement Portal, since this is a separate internal tool.

**Reference or inspiration:** None provided.

---

## Section 11 — API and Credentials

| Service | What it does in this tool | Key required | Where key is stored |
|---------|--------------------------|-------------|-------------------|
| Supabase | Database (read existing tables + read/write submission_reviews), Auth (team login), file access (signed URLs for existing uploaded files) | Anon/publishable key (browser-safe) + Service role key (server-side only, if needed for signed URL generation) | Netlify environment variables |

**Credentials readiness:**

| Credential | Status | Where to get it |
|-----------|--------|----------------|
| Supabase anon/publishable key | Available — same existing project, key visible in dashboard | Supabase dashboard → Project Settings → API Keys |
| Supabase service role key | Available — same existing project | Supabase dashboard → Project Settings → API Keys |

No other services (no Resend, no AI provider) are needed — all arms are inactive for this version.

---

## Section 12 — Out of Scope — Phase 2

| Deferred feature | Reason it is deferred |
|-----------------|----------------------|
| Editing the supplier's original submission data (identity, EcoVadis file, questionnaire answers) | This tool is explicitly read-only on the portal's own data — only the new review_status field is editable |
| Different roles/permissions among team members | All team members currently need identical access |
| CSV/data export | Not needed for this version |
| Email alerts on new red flags or new submissions | Not needed for this version — dashboard is checked manually |
| AI-generated summaries or risk explanations | Not needed for this version |
| Scheduled automation of any kind | Not needed for this version |

---

## Section 13 — Acceptance Criteria

| # | What to verify | Expected result | Done? |
|---|---------------|-----------------|-------|
| 1 | Login gate works | Cannot reach any view without signing in with a valid invited account | [ ] |
| 2 | Home/Summary counts are correct | EcoVadis-complete count, Questionnaire-complete count, in-progress count, and need-review count all match the underlying data | [ ] |
| 3 | Red Flags view accuracy | Every questionnaire respondent matching any of the four rules appears, with the correct rule(s) shown; no EcoVadis-only respondent appears | [ ] |
| 4 | Suppliers Table search | Searching by company name filters the table correctly | [ ] |
| 5 | Review status is editable and persists | Changing review status in the table or detail view saves to submission_reviews and is visible on reload / to another logged-in user | [ ] |
| 6 | Detail view accuracy | Clicking a row shows correct identity data, and the correct file link or questionnaire answers depending on door_type/mode | [ ] |
| 7 | Existing supplier portal untouched | The Supplier Engagement Portal's public flow (capture, upload, questionnaire) still works exactly as before after this tool's RLS/schema additions | [ ] |
| 8 | GDPR confirmation | No new personal-data collection form exists in this tool beyond the login | [ ] |
| 9 | Live deployment | Tool loads correctly at its own Netlify URL on desktop and mobile, and is not reachable without login | [ ] |

---

## Section 14 — Build Path

**This tool's tier:** Tier 3

### Pre-build steps
- [ ] Tool Architect skill — interview complete, this spec confirmed
- [ ] Project Governor skill — CLAUDE.md and PROGRESS.md produced from this spec
- [ ] New GitHub repo created by the builder (separate from the Supplier Engagement Portal's repo)
- [ ] product-spec.md, CLAUDE.md, PROGRESS.md uploaded to this new repo's root
- [ ] A copy of the Supplier Engagement Portal's docs/supabase-setup.md made available to this build (it lives in a different repo)
- [ ] Decide whether to activate Netlify MCP for this project before the build session

### Tier 3 — build session
- [ ] Open Claude Code in the new project folder
- [ ] Claude Code runs First Session Setup
- [ ] Claude Code reads product-spec.md, CLAUDE.md, PROGRESS.md, and the copied supabase-setup.md from the sibling project
- [ ] Claude Code connects to the EXISTING Supabase project (ID: yfshmobaatyruymcpbex) via MCP — reviews current schema before making any changes
- [ ] Claude Code adds the new submission_reviews table, new RLS policies for the authenticated role on the three existing tables, and Supabase Auth (email/password, invite-only) — without touching any existing anon policy
- [ ] Claude Code creates this tool's own docs/supabase-setup.md, documenting only what it added, with a reference to the sibling project's file for the full schema
- [ ] Claude Code builds the frontend (React + Vite + Tailwind): Login, Home/Summary, Red Flags, Suppliers Table, Supplier Detail
- [ ] Test locally before deploying — including a check that the existing Supplier Engagement Portal still works
- [ ] Set environment variables and deploy per the Netlify MCP decision above
- [ ] Optional post-build: run Supabase QA skill to verify schema, RLS, and auth configuration — especially that the sibling tool's anon policies are untouched

---

## Section 15 — Open Questions

| Question | Who answers it | Blocking? |
|----------|---------------|-----------|
| Netlify MCP active for this new project, or manual deploy? | Builder | No — can resolve during build |
| Exact brand hex colors (currently provisional: #F7F8FA background, #14213D text/accent) | Builder | No — can confirm during/after build |
| Stay on Supabase Free plan (project pauses after ~1 week idle) or upgrade to Pro now that two tools share it? | Builder | No — can resolve after build, but affects reliability of both tools |

---

## Section 16 — Tool Version History

| Version | Date | What changed in the tool |
|---------|------|--------------------------|
| v1.0 | 2026-09-15 | Initial build |

---

*This spec is written for Claude Code. It assumes zero prior context.*

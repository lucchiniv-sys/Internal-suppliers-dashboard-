# Sustainable Suppliers Dashboard — Internal Use Only

## Identity
An internal analytics and review dashboard for The Corporate's sustainability team, reading submissions already collected by the public Supplier Engagement Portal, accessed with a username and password.
Tier: 3 — login required, data persists to Supabase (D3+A2)
Spec version governed: v1.0 — the version of docs/product-spec.md these rules were derived from.
Position: Tool 2 of 2 in the AI Lab project supplier portal stack — shares the Supabase project with Supplier Engagement Portal; this tool builds on the existing schema, it does not create it.

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
2. If the database was touched (any table, policy, bucket, or auth change), update docs/supabase-setup.md in the same save point.
3. Commit and push to main.
4. Tell the builder in one line: "Save point committed: [what changed]."
Do not start the next piece of work before the save point is pushed. Never end a session without one — an ending session is a save point.

First Session Setup (session 1 only):
1. Create docs/ and move product-spec.md into it. Move the sibling project's supabase-setup.md into docs/ as well, renaming it docs/supabase-setup-portal.md to distinguish it from this tool's own docs/supabase-setup.md (created fresh at the end of session 1).
2. Announce what moved, then commit and push before building anything.

PROGRESS.md structure (for the recreate rule): status header (Session / Last updated / Live URL), Current state, Last session (3–5 lines, replace each session), Remaining work (shrinking checklist), Build decisions (one line each), Known issues, Notes for next session.

## Commands
```
npx serve .
```

## Tech Stack
HTML · CSS · JavaScript · Netlify · Supabase
Deployment: GitHub → Netlify, auto-deploys from main. Netlify MCP is not active — the builder connects the repo and enters environment variables in the Netlify dashboard; remind them before the first deploy.

**Build decision (session 1):** switched from the originally specced React + Vite + Tailwind to plain HTML/CSS/JS. The build environment has no Node.js/npm available, so a Vite build could not be tested locally before pushing — every iteration would have meant guessing at Netlify's own build result and burning build minutes on failures. Plain HTML/JS needs no build step (matches the sibling Supplier Engagement Portal's stack) and can be verified directly against the deployed site. Functionality is unchanged from the spec.

## Environment Variables
SUPABASE_URL — Supabase: Project Settings → API Keys → Project URL — Netlify env var. Since this is a plain HTML/JS site with no build step, the frontend fetches this (and SUPABASE_ANON_KEY) at runtime from a small config-serving Netlify Function (`public-config.js`), same pattern as the sibling tool — never hardcoded in a committed file.
SUPABASE_ANON_KEY — Supabase: Project Settings → API Keys → publishable/anon key — Netlify env var, served the same way as SUPABASE_URL above.
SUPABASE_SERVICE_ROLE_KEY — Supabase: Project Settings → API Keys → service_role/secret key — Netlify env var, server-side only, used only inside a Netlify Function to (a) verify the caller has a valid logged-in session and (b) generate a signed URL for viewing an existing uploaded file (the shared Storage bucket has no policy granting authenticated users direct read access). Never sent to the browser.

Key storage follows function placement: Netlify Functions and the frontend read Netlify environment variables. No value ever appears in code or in any file committed to GitHub. At session start, confirm these exist before first use; prompt the builder for any that are missing.

## Supabase
Project: "AI Lab project supplier portal" — already exists (ID: yfshmobaatyruymcpbex, URL: https://yfshmobaatyruymcpbex.supabase.co). docs/supabase-setup-portal.md (moved in session 1 from the sibling project) documents its current schema — read it before any database work. Never recreate or modify any table, policy, or grant it describes; this tool only adds to the schema.
Plan: Free — builder has confirmed staying on Free for now. The project pauses after roughly a week of no traffic; now shared by two tools, so both go offline together if idle. Flagged in PROGRESS.md Known Issues.

Tables this tool uses (read-only, already exist — do not modify):
respondents: company_name, contact_name, contact_email, door_type, status, created_at, updated_at
ecovadis_submissions: respondent_id (FK), file_url, uploaded_at
questionnaire_submissions: respondent_id (FK), mode, file_url, responses (jsonb), updated_at
RLS: anon policies on all three above are owned by the Supplier Engagement Portal — never touch them.

New table to create for this tool (then document in docs/supabase-setup.md):
submission_reviews: respondent_id (FK to respondents, unique), review_status (enum: new_to_be_analysed / need_review / final_submission, default new_to_be_analysed), updated_at

RLS — build these policies, never skip:
respondents / ecovadis_submissions / questionnaire_submissions: authenticated — read all rows, no insert/update/delete. Anon — no access (unchanged; do not add or remove anything here).
submission_reviews: authenticated — read all rows, insert allowed, update allowed. Anon — no access at all.

Auth: email and password — invite-only (builder invites team members via the Supabase dashboard).

After setup, write docs/supabase-setup.md and update it at every save point that touches the database. It must contain: project name, project ID, project URL, plan, every table with field names and types, RLS policies per table, auth configuration, notes for future sessions, and a last-updated line with date and session number. From the moment it exists, that file is the schema source of truth for this tool (see docs/supabase-setup-portal.md for the sibling tool's part of the shared schema).

## Hard Rules
- API keys never in any frontend file or GitHub commit. The Supabase URL and anon key are served to the browser only via the public-config.js Netlify Function, never hardcoded. The service role key is only ever read inside a server-side Netlify Function.
- Netlify Identity: never. Supabase Auth is the only authentication system in this stack.
- RLS: never disabled on any table. If a query fails, fix the policy or the query — never disable RLS to work around it.
- Supabase service role key required for generating signed URLs to view existing uploaded files (EcoVadis PDFs, questionnaire Excel files) from the Supplier Detail view, since the shared Storage bucket has no policy granting authenticated users direct read access. Stored as SUPABASE_SERVICE_ROLE_KEY, used only inside a Netlify Function — never in code or the browser. Before returning a signed URL, that function must verify the caller's Supabase Auth session token is valid (via supabase.auth.getUser) — anyone who could call it without a valid session would get access to supplier files without logging in.
- This tool shares a Supabase project with Supplier Engagement Portal. Protected tables — respondents, ecovadis_submissions, questionnaire_submissions, and the submissions Storage bucket — must never have their existing schema, anon RLS policies, or grants modified or removed. This tool may only ADD new SELECT policies for the authenticated role on those tables, and manage its own submission_reviews table freely. Query the protected tables only as documented in docs/supabase-setup-portal.md.

## Project Structure
```
/                     ← root: CLAUDE.md, PROGRESS.md, index.html (login), dashboard.html (main app)
/netlify/functions    ← public-config.js, signed-file-url.js (service-role-backed)
/docs                 ← product-spec.md, supabase-setup.md, supabase-setup-portal.md
```

## Brand
No brand skill yet. These inline rules apply until one is added to the repo:
- Background: #F7F8FA · Accent/Text: #14213D · Font: not specified — use Inter as a clean default
- Clean and minimal — deliberately different from the black/white Supplier Engagement Portal, since this is a separate internal tool

## Business Rules
- Red flag (Red Flags view, questionnaire respondents only): flagged if pfas_present = "Yes", OR sbti_target = "No", OR high_water_stress_region = "Yes", OR any field in questionnaire_submissions.responses = "Not Available" (literal string match).
- Home/Summary counts: EcoVadis-complete = respondents where door_type=ecovadis and status=complete; Questionnaire-complete = respondents where door_type=questionnaire and status=complete; in-progress = respondents where status=in_progress; need-review = submission_reviews where review_status=need_review.
- review_status defaults to 'new_to_be_analysed' on first view of a supplier with no existing review row; editable inline from both the Suppliers Table and the Supplier Detail view.
- EcoVadis-only respondents never appear in Red Flags — that logic only applies to questionnaire responses.

Out of scope — do not build:
- Editing the supplier's original submission data (identity, EcoVadis file, questionnaire answers) — this tool is read-only on that data
- Different roles/permissions among team members — all have identical access
- CSV/data export
- Email alerts on new red flags or new submissions
- AI-generated summaries or risk explanations
- Any scheduled automation

## Reference Docs
Read before building the related part:
- docs/product-spec.md — full module specs, UI sections, logic, arm detail
- docs/supabase-setup.md — this tool's schema additions (created in session 1)
- docs/supabase-setup-portal.md — the sibling tool's schema (read-only reference — never edit)
PROGRESS.md in the root is read at every session start per the Session Protocol.

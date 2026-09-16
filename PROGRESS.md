# PROGRESS — Sustainable Suppliers Dashboard — Internal Use Only

> Claude Code: read this file at the start of every session, before touching anything. Update it at every save point. Replace content — do not append. History lives in git.

**Session:** 1 — in progress
**Last updated:** 2026-09-16 — Session 1
**Live URL:** none yet

## Current state
Database side is done and verified: connected to the existing Supabase project, added the `submission_reviews` table with RLS, and granted the `authenticated` role read-only access to the three existing portal tables (they had zero grants before — this tool is the first to introduce Supabase Auth to this project). Verified afterward that all five sibling RPCs and every existing anon-facing grant/policy are untouched. Wrote docs/supabase-setup.md. No frontend built yet.

## Last session
Session 1 (2026-09-16): Connected the local project folder to the GitHub repo, ran First Session Setup. Connected to the existing Supabase project via MCP, applied migration `add_sustainable_suppliers_dashboard_schema` (new submission_reviews table + authenticated-role read policies on respondents/ecovadis_submissions/questionnaire_submissions), verified the sibling tool's schema was untouched, wrote docs/supabase-setup.md. Next: confirm Supabase email/password auth provider is enabled, then build the frontend.

## Remaining work
- [x] First Session Setup: create docs/, move product-spec.md and the sibling supabase-setup.md into it (renamed supabase-setup-portal.md), commit (see CLAUDE.md Session Protocol)
- [x] Connect to Supabase project "AI Lab project supplier portal" (ID yfshmobaatyruymcpbex) and read docs/supabase-setup-portal.md before any database work
- [x] Create this tool's new table (submission_reviews) and RLS policies, without touching any existing table/policy — then write this tool's own docs/supabase-setup.md
- [ ] Confirm the Supabase email/password Auth provider is enabled (Authentication → Providers), and invite the first team member(s) (Authentication → Users → Invite)
- [ ] Build Login view
- [ ] Build Home/Summary view — EcoVadis-complete, Questionnaire-complete, in-progress, and need-review counts
- [ ] Build Red Flags view — flagged questionnaire respondents with triggered rule(s) shown
- [ ] Build Suppliers Table — searchable by company name, with editable review status
- [ ] Build Supplier Detail view — full identity, file link or questionnaire answers, editable review status
- [ ] Local test pass — full walkthrough of every view before deploying, including confirming the existing Supplier Engagement Portal still works unchanged
- [ ] Acceptance criteria pass — verify every criterion in spec Section "Acceptance Criteria" before deploy
- [ ] Deploy to Netlify — builder adds environment variables in the Netlify dashboard (or activates Netlify MCP first, if decided by then)

## Build decisions
- The `authenticated` role had zero grants on respondents/ecovadis_submissions/questionnaire_submissions before this build (same lockdown as anon) — explicit `grant select ... to authenticated` was required in addition to the RLS policies, since a policy alone does nothing without the base grant.
- submission_reviews RLS uses `using (true)`/`with check (true)` for all authenticated operations — matches the spec's "all team members have identical access" requirement; revisit if per-user restriction is ever needed.
- Switched from the specced React + Vite + Tailwind to plain HTML/CSS/JS (builder approved) — no Node.js in the build environment to test a Vite build locally before pushing. No functional change from the spec.

## Known issues
- Netlify MCP activation not yet decided — builder to confirm before or during the build session.
- Brand colors provisional (#F7F8FA background, #14213D accent/text) — confirm before first deployment.
- Supabase project is on the Free plan, now shared by two tools — pauses after ~1 week of no traffic, taking both tools offline together. Builder is aware and has chosen to stay on Free for now; monitor and reconsider Pro if this becomes disruptive.

## Notes for next session
None.

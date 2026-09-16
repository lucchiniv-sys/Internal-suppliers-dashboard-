# PROGRESS — Sustainable Suppliers Dashboard — Internal Use Only

> Claude Code: read this file at the start of every session, before touching anything. Update it at every save point. Replace content — do not append. History lives in git.

**Session:** 1 — in progress
**Last updated:** 2026-09-16 — Session 1
**Live URL:** none yet

## Current state
Database and frontend code are both done, not yet deployed. Database: submission_reviews table + RLS live and verified, sibling tool's schema untouched. Frontend: index.html (login), dashboard.html (summary, red flags, searchable suppliers table with inline editable review status, detail modal), netlify/functions/public-config.js, netlify/functions/signed-file-url.js (auth-gated signed URLs for viewing uploaded files) — all written, not yet tested live since there is no Netlify site for this repo yet.

## Last session
Session 1 (2026-09-16): Connected the local project folder to the GitHub repo, ran First Session Setup, built the database schema (submission_reviews + authenticated-role read access), switched the frontend stack from React+Vite to plain HTML/JS (no Node.js available to test a Vite build locally), and wrote the full frontend: login page, dashboard with all 4 sections, and the two Netlify Functions. Next: create the Netlify site for this repo, set environment variables, and test end-to-end against the live deploy.

## Remaining work
- [x] First Session Setup: create docs/, move product-spec.md and the sibling supabase-setup.md into it (renamed supabase-setup-portal.md), commit (see CLAUDE.md Session Protocol)
- [x] Connect to Supabase project "AI Lab project supplier portal" (ID yfshmobaatyruymcpbex) and read docs/supabase-setup-portal.md before any database work
- [x] Create this tool's new table (submission_reviews) and RLS policies, without touching any existing table/policy — then write this tool's own docs/supabase-setup.md
- [ ] Confirm the Supabase email/password Auth provider is enabled (Authentication → Providers), and invite the first team member(s) (Authentication → Users → Invite)
- [x] Build Login view
- [x] Build Home/Summary view — EcoVadis-complete, Questionnaire-complete, in-progress, and need-review counts
- [x] Build Red Flags view — flagged questionnaire respondents with triggered rule(s) shown
- [x] Build Suppliers Table — searchable by company name, with editable review status
- [x] Build Supplier Detail view — full identity, file link or questionnaire answers, editable review status
- [ ] Create the Netlify site for this repo and connect it to GitHub (no site exists yet — this is a brand-new repo)
- [ ] Set Netlify env vars: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- [ ] Local/live test pass — full walkthrough of every view on the deployed site (login, summary counts, red flags, search, review status editing, file viewing, sign out), including confirming the existing Supplier Engagement Portal still works unchanged
- [ ] Acceptance criteria pass — verify every criterion in spec Section "Acceptance Criteria" before calling this done
- [ ] Restrict the site to the team (currently no Netlify-level password on top of the app's own login — decide if that's wanted in addition)

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

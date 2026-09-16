# PROGRESS — Sustainable Suppliers Dashboard — Internal Use Only

> Claude Code: read this file at the start of every session, before touching anything. Update it at every save point. Replace content — do not append. History lives in git.

**Session:** 1 — in progress
**Last updated:** 2026-09-16 — Session 1
**Live URL:** none yet

## Current state
First Session Setup complete: docs/ created, product-spec.md and supabase-setup-portal.md (the sibling tool's schema reference) moved into it. Nothing else built yet.

## Last session
Session 1 (2026-09-16): Connected the local project folder to the GitHub repo, ran First Session Setup (docs/ created, reference files moved). Next: connect to the existing Supabase project and start building the schema additions.

## Remaining work
- [x] First Session Setup: create docs/, move product-spec.md and the sibling supabase-setup.md into it (renamed supabase-setup-portal.md), commit (see CLAUDE.md Session Protocol)
- [ ] Connect to Supabase project "AI Lab project supplier portal" (ID yfshmobaatyruymcpbex) and read docs/supabase-setup-portal.md before any database work
- [ ] Create this tool's new table (submission_reviews) and RLS policies, plus Auth configuration (email/password, invite-only), without touching any existing table/policy — then write this tool's own docs/supabase-setup.md
- [ ] Build Login view
- [ ] Build Home/Summary view — EcoVadis-complete, Questionnaire-complete, in-progress, and need-review counts
- [ ] Build Red Flags view — flagged questionnaire respondents with triggered rule(s) shown
- [ ] Build Suppliers Table — searchable by company name, with editable review status
- [ ] Build Supplier Detail view — full identity, file link or questionnaire answers, editable review status
- [ ] Local test pass — full walkthrough of every view before deploying, including confirming the existing Supplier Engagement Portal still works unchanged
- [ ] Acceptance criteria pass — verify every criterion in spec Section "Acceptance Criteria" before deploy
- [ ] Deploy to Netlify — builder adds environment variables in the Netlify dashboard (or activates Netlify MCP first, if decided by then)

## Build decisions
None yet.

## Known issues
- Netlify MCP activation not yet decided — builder to confirm before or during the build session.
- Brand colors provisional (#F7F8FA background, #14213D accent/text) — confirm before first deployment.
- Supabase project is on the Free plan, now shared by two tools — pauses after ~1 week of no traffic, taking both tools offline together. Builder is aware and has chosen to stay on Free for now; monitor and reconsider Pro if this becomes disruptive.

## Notes for next session
None.

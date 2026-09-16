# PROGRESS — Sustainable Suppliers Dashboard — Internal Use Only

> Claude Code: read this file at the start of every session, before touching anything. Update it at every save point. Replace content — do not append. History lives in git.

**Session:** 1 — in progress
**Last updated:** 2026-09-16 — Session 1
**Live URL:** https://miadb.netlify.app (public)

## Current state
Live and working, fully verified: login, Summary counts, Red Flags, the searchable Suppliers Table (Type badge, inline-editable Review Status), Supplier Detail view, and the signed file-view link (confirmed 200, correct Supabase Storage URL) all tested against the deployed site with a temporary QA account (created and deleted via the Supabase Admin API during this session). One bug found and fixed: signed-file-url.js returned "not configured" because SUPABASE_SERVICE_ROLE_KEY was set with the `envVarIsSecret` flag, which silently failed to persist the value (same failure mode as on the sibling tool) — re-set without that flag and redeployed.

## Last session
Session 1 (2026-09-16): Full build — schema (submission_reviews + authenticated-role read access), frontend (login, dashboard with all 4 sections, plain HTML/JS instead of the specced React/Vite since this environment has no Node.js), Netlify site "miadb" created, env vars set, deployed. Live-tested: login required a redo (user's password re-entry mismatch, resolved), added a Type column to the suppliers table per builder feedback, found and fixed the service-role-key env var bug. Created and will remove a temporary QA test account (qa-test-dashboard@example.com) used for verification — real team accounts are the builder's own.

## Remaining work
- [ ] Invite the real team member(s) via Authentication → Users → Invite (or Create new user); the builder already has her own working account
- [ ] Test the online-questionnaire detail rendering (grouped Q&A by section) — no respondent has completed the online path yet, only excel_upload and in-progress exist, so this path is unverified
- [ ] Test a genuine Red Flag once a supplier completes the online questionnaire with a flagged answer
- [ ] Acceptance criteria pass — verify every criterion in spec Section "Acceptance Criteria" before calling this done
- [ ] Decide whether to add a Netlify-level password on top of the app's own login (not requested in the spec; app login is the only gate today)

## Build decisions
- The `authenticated` role had zero grants on respondents/ecovadis_submissions/questionnaire_submissions before this build (same lockdown as anon) — explicit `grant select ... to authenticated` was required in addition to the RLS policies, since a policy alone does nothing without the base grant.
- submission_reviews RLS uses `using (true)`/`with check (true)` for all authenticated operations — matches the spec's "all team members have identical access" requirement; revisit if per-user restriction is ever needed.
- Switched from the specced React + Vite + Tailwind to plain HTML/CSS/JS (builder approved) — no Node.js in the build environment to test a Vite build locally before pushing. No functional change from the spec.

## Known issues
- Setting a Netlify env var with `envVarIsSecret: true` via the Netlify MCP tool silently fails to persist the value (confirmed on both this project and the sibling one) — always set without that flag, then verify with getAllEnvVars before trusting it, and always redeploy after any env var change since functions only pick up new values on their next deploy.
- Netlify MCP not activated for this repo — deploys happen via GitHub push, env vars are set manually via MCP by Claude Code (not a fully manual process, but not the "Netlify MCP active, fully automated" path either).
- Brand colors provisional (#F7F8FA background, #14213D accent/text) — confirm before first deployment.
- Supabase project is on the Free plan, now shared by two tools — pauses after ~1 week of no traffic, taking both tools offline together. Builder is aware and has chosen to stay on Free for now; monitor and reconsider Pro if this becomes disruptive.

## Notes for next session
None.

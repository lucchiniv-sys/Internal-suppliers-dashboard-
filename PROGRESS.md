# PROGRESS — Sustainable Suppliers Dashboard — Internal Use Only

> Claude Code: read this file at the start of every session, before touching anything. Update it at every save point. Replace content — do not append. History lives in git.

**Session:** 3 — in progress
**Last updated:** 2026-09-23 — Session 3
**Live URL:** https://miadb.netlify.app (public)

## Current state
Live and verified end-to-end: login, forgot-password (including a real emailed reset link, confirmed working by the builder on 2026-09-23), Summary (stat cards + "Submissions by type" pie chart), Red Flags, searchable Suppliers Table (Type badge, inline Review Status), Supplier Detail with signed file links, two-page navigation (Summary first, button to Suppliers & Red Flags). Remaining open items are non-blocking (see below).

## Last session
Session 2 (2026-09-21): Added the forgot-password feature at the builder's request (not in spec v1.0). Verified with a recovery link generated via the Supabase Admin API: password-mismatch check, successful change, old password rejected/new accepted, redirect to dashboard, and the invalid/expired-link state; temporary QA account deleted afterwards (only the builder's own account remains). Found that Supabase ignored our redirect and fell back to http://localhost:3000 because the site was not in the project's allowed Redirect URLs (the builder's first real reset email led to a dead page); after the builder added `https://miadb.netlify.app/**` and `https://miadb.netlify.app/reset-password.html`, re-tested with Admin-API links and the redirect is correct. The builder then hit Supabase's built-in email rate limit. Also fixed netlify.toml so the new page is copied into dist/. (Session 1, 2026-09-16→18: full build, Type column, pie chart, two-page split; details in git history.)

Session 3 (2026-09-23): Builder confirmed a real forgot-password email arrived and its link opened "Choose a new password" correctly — the flow is fully working, not just verified via the Admin API.

## Remaining work
- [x] Builder: requested a real reset email and confirmed the link lands on "Choose a new password"
- [ ] Decide on custom SMTP (Authentication → SMTP Settings) if team members outside the Supabase org need reset/invite emails
- [ ] Invite the real team member(s) via Authentication → Users → Invite (or Create new user); the builder already has her own working account
- [ ] Acceptance criteria pass — verify every criterion in spec Section "Acceptance Criteria" before calling this done
- [ ] Decide whether to add a Netlify-level password on top of the app's own login (not requested in the spec; app login is the only gate today)
- [ ] Optional cleanup: decide what to do with the unrelated duplicate Netlify site "frabjous-dolphin-72bbf3" (belongs to the sibling Supplier Engagement Portal repo, not this one)

## Build decisions
- The `authenticated` role had zero grants on respondents/ecovadis_submissions/questionnaire_submissions before this build (same lockdown as anon) — explicit `grant select ... to authenticated` was required in addition to the RLS policies, since a policy alone does nothing without the base grant.
- submission_reviews RLS uses `using (true)`/`with check (true)` for all authenticated operations — matches the spec's "all team members have identical access" requirement; revisit if per-user restriction is ever needed.
- Switched from the specced React + Vite + Tailwind to plain HTML/CSS/JS (builder approved) — no Node.js in the build environment to test a Vite build locally before pushing. No functional change from the spec.
- Forgot-password (added at builder's request, beyond spec v1.0): the request form shows the same neutral "if an account exists…" message whether or not the email exists, so it can't be used to probe which addresses are team members; new passwords require ≥ 8 characters, checked client-side (Supabase's own minimum is lower).
- Pie chart is hand-drawn inline SVG (no charting library) — three slices only, not worth a dependency, and keeps this a zero-build static site.
- Two-page split (Summary / Details) implemented as two `<div>`s toggled via `hidden`, not separate HTML files — keeps a single shared data load and avoids a second auth/session check.

## Known issues
- Supabase's built-in email sender is rate-limited and (on the default setup) only delivers to Supabase org/project team addresses — a colleague outside the org may never receive a reset or invite email. Not tested with a real inbox (`example.com` addresses are rejected by Supabase, and no real email was sent during testing).
- The Auth Site URL / Redirect URL settings are project-wide, shared with the Supplier Engagement Portal (which uses no Auth) — only ADD entries, never remove existing ones.
- Setting a Netlify env var with `envVarIsSecret: true` via the Netlify MCP tool silently fails to persist the value (confirmed on both this project and the sibling one) — always set without that flag, then verify with getAllEnvVars before trusting it, and always redeploy after any env var change since functions only pick up new values on their next deploy.
- Netlify MCP not activated for this repo — deploys happen via GitHub push, env vars are set manually via MCP by Claude Code (not a fully manual process, but not the "Netlify MCP active, fully automated" path either).
- Brand colors provisional (#F7F8FA background, #14213D accent/text) — confirm before first deployment.
- Supabase project is on the Free plan, now shared by two tools — pauses after ~1 week of no traffic, taking both tools offline together. Builder is aware and has chosen to stay on Free for now; monitor and reconsider Pro if this becomes disruptive.

## Notes for next session
None.

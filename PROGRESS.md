# PROGRESS — Sustainable Suppliers Dashboard — Internal Use Only

> Claude Code: read this file at the start of every session, before touching anything. Update it at every save point. Replace content — do not append. History lives in git.

**Session:** 1 — in progress
**Last updated:** 2026-09-18 — Session 1
**Live URL:** https://miadb.netlify.app (public)

## Current state
Live and fully verified, including two builder-requested improvements added this session: (1) a "Submissions by type" pie chart on the Summary view (EcoVadis / Excel uploaded / Online questionnaire, computed from the same data already loaded — no new queries), and (2) split the dashboard into two pages — Summary opens first by default, with a "View Suppliers & Red Flags →" button leading to the Red Flags + Suppliers Table page (and a back button). Also verified a genuine Red Flag end-to-end against real data (a supplier's online submission answered Yes/No/Yes on the three flagged fields plus one "Not Available" — all four reasons showed correctly).

## Last session
Session 1 (2026-09-16 → 2026-09-18): Full build (schema, frontend, deploy) — see Build decisions for the React→HTML/JS switch. Live-tested and fixed two bugs: a login password mismatch (user error, resolved) and the SUPABASE_SERVICE_ROLE_KEY env var silently failing to save when marked secret (see Known issues). Added a Type column (EcoVadis/Questionnaire badge) to the suppliers table. On 2026-09-18: builder discovered a second, unconfigured Netlify site ("frabjous-dolphin-72bbf3") for the SIBLING repo (Supplier Engagement Portal) — not this tool — likely created by mistake during an "Import from Git" flow; two of its three env vars were set before the builder said to stop and keep using the original working site instead. That duplicate site is unrelated to this dashboard and needs no further action here. Then added the pie chart and the two-page Summary/Details split; verified both live with a temporary QA account (created and deleted via the Supabase Admin API).

## Remaining work
- [ ] Invite the real team member(s) via Authentication → Users → Invite (or Create new user); the builder already has her own working account
- [ ] Acceptance criteria pass — verify every criterion in spec Section "Acceptance Criteria" before calling this done
- [ ] Decide whether to add a Netlify-level password on top of the app's own login (not requested in the spec; app login is the only gate today)
- [ ] Optional cleanup: decide what to do with the unrelated duplicate Netlify site "frabjous-dolphin-72bbf3" (belongs to the sibling Supplier Engagement Portal repo, not this one)

## Build decisions
- The `authenticated` role had zero grants on respondents/ecovadis_submissions/questionnaire_submissions before this build (same lockdown as anon) — explicit `grant select ... to authenticated` was required in addition to the RLS policies, since a policy alone does nothing without the base grant.
- submission_reviews RLS uses `using (true)`/`with check (true)` for all authenticated operations — matches the spec's "all team members have identical access" requirement; revisit if per-user restriction is ever needed.
- Switched from the specced React + Vite + Tailwind to plain HTML/CSS/JS (builder approved) — no Node.js in the build environment to test a Vite build locally before pushing. No functional change from the spec.
- Pie chart is hand-drawn inline SVG (no charting library) — three slices only, not worth a dependency, and keeps this a zero-build static site.
- Two-page split (Summary / Details) implemented as two `<div>`s toggled via `hidden`, not separate HTML files — keeps a single shared data load and avoids a second auth/session check.

## Known issues
- Setting a Netlify env var with `envVarIsSecret: true` via the Netlify MCP tool silently fails to persist the value (confirmed on both this project and the sibling one) — always set without that flag, then verify with getAllEnvVars before trusting it, and always redeploy after any env var change since functions only pick up new values on their next deploy.
- Netlify MCP not activated for this repo — deploys happen via GitHub push, env vars are set manually via MCP by Claude Code (not a fully manual process, but not the "Netlify MCP active, fully automated" path either).
- Brand colors provisional (#F7F8FA background, #14213D accent/text) — confirm before first deployment.
- Supabase project is on the Free plan, now shared by two tools — pauses after ~1 week of no traffic, taking both tools offline together. Builder is aware and has chosen to stay on Free for now; monitor and reconsider Pro if this becomes disruptive.

## Notes for next session
None.

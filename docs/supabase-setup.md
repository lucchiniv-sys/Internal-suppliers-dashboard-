# Supabase Setup — Sustainable Suppliers Dashboard — Internal Use Only

**Last updated:** 2026-09-16 — Session 1

This tool shares a Supabase project with **Supplier Engagement Portal**. This file
documents only what THIS tool added. For the full picture of the shared project
(the three tables this tool reads from), see [docs/supabase-setup-portal.md](supabase-setup-portal.md).

## Project

| Detail | Value |
|---|---|
| Name | AI Lab project supplier portal |
| Project ID | `yfshmobaatyruymcpbex` |
| Project URL | https://yfshmobaatyruymcpbex.supabase.co |
| Dashboard | https://supabase.com/dashboard/project/yfshmobaatyruymcpbex |
| Plan | Free — confirmed by the builder; the project pauses after ~1 week of no traffic, now affecting both tools sharing it |

## New table added by this tool

### `submission_reviews`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | default `gen_random_uuid()` |
| respondent_id | uuid, not null, **unique** | FK → `respondents(id)` on delete cascade — one review record per supplier |
| review_status | text, not null | `new_to_be_analysed` (default) \| `need_review` \| `final_submission` |
| updated_at | timestamptz, not null | default `now()` |

## RLS and access changes made by this tool

**New table `submission_reviews`:** RLS enabled. `authenticated` role granted SELECT/INSERT/UPDATE with policies using `(true)` — every logged-in team member has identical access (no per-user restriction, matching the "all team members equal" access model). No `anon` access at all.

**Additive READ-ONLY access on the existing portal tables**, for the `authenticated` role only — nothing on `anon` was touched:
- `respondents`: `grant select ... to authenticated` + policy `authenticated read respondents` (`using (true)`)
- `ecovadis_submissions`: `grant select ... to authenticated` + policy `authenticated read ecovadis_submissions` (`using (true)`)
- `questionnaire_submissions`: `grant select ... to authenticated` + policy `authenticated read questionnaire_submissions` (`using (true)`)

Before this change, the `authenticated` role had zero grants on any of these three tables (confirmed via `information_schema.role_table_grants` before applying the migration) — same lockdown as `anon`, since the portal never used Supabase Auth. This tool is the first to introduce Supabase Auth into this project.

**Untouched, verified after migration:** all five existing RPC functions (`capture_respondent`, `mark_respondent_complete`, `get_questionnaire_progress`, `save_ecovadis_submission`, `save_questionnaire_submission`) and every existing `anon`-facing grant/policy. See docs/supabase-setup-portal.md for their definitions.

## Auth

Method: email and password. Signup: invite-only — the builder invites team members directly via the Supabase dashboard (Authentication → Users → Invite). Email/password auth is Supabase's default provider and should already be enabled; confirm under Authentication → Providers before relying on it.

## File access

The `submissions` Storage bucket (owned by Supplier Engagement Portal) has no policy granting `authenticated` users direct read access. This tool's Supplier Detail view generates short-lived signed URLs server-side, via a Netlify Function using `SUPABASE_SERVICE_ROLE_KEY` — not through a client-side Storage policy.

## Migration applied

Applied directly via Supabase MCP (`apply_migration`) on 2026-09-16, name `add_sustainable_suppliers_dashboard_schema`. Verified afterward: policies present as expected (`pg_policies`), all five sibling RPCs still present (`pg_proc`).

## Notes for future sessions

- If a future session needs to restrict which team members can do what (e.g. an admin-only action), that would require moving from a single shared `authenticated` policy to role-based policies (e.g. a `user_roles` table) — not needed for this version, everyone has identical access.
- `submission_reviews.respondent_id` is UNIQUE by design (one row per respondent) — if a future version needs a history of status changes over time, this would need to become a log table instead.

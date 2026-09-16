# Supabase Setup — Supplier Engagement Portal

**Last updated:** 2026-09-15 — Session 2
**Status: CONFIRMED LIVE AND VERIFIED END-TO-END.** migration_001_schema.sql and migration_002_lock_down_submissions.sql are both applied. Schema confirmed via list_tables/get_advisors/pg_policies, and the fixed RPC flow confirmed working against the deployed site itself (capture_respondent + save_ecovadis_submission both succeed with no RLS/permission errors). This file is the current schema source of truth.

## Project

| Detail | Value |
|---|---|
| Name | AI Lab project supplier portal (`the-corporate-sustainability` in the spec) |
| Project ID | `yfshmobaatyruymcpbex` |
| Region | eu-west-2 |
| Dashboard | https://supabase.com/dashboard/project/yfshmobaatyruymcpbex |
| Plan | Unconfirmed — spec requires Pro (always-on); builder to confirm/upgrade before client use |
| Pre-existing state | Project existed empty (no tables) before this build |

## Tables

### `respondents`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | default `gen_random_uuid()` |
| company_name | text, not null | matched case-insensitive + trimmed for resume lookup |
| contact_name | text, not null | overwritten on resume with latest value |
| contact_email | text, not null | overwritten on resume with latest value |
| door_type | text, not null | `ecovadis` \| `questionnaire` |
| status | text, not null | `in_progress` (default) \| `complete` |
| user_id | uuid, null | FK → `auth.users(id)` on delete set null — unused until a future login build |
| last_reminder_sent_at | timestamptz, null | stamped by the weekly scheduled function |
| created_at | timestamptz, not null | default `now()` |
| updated_at | timestamptz, not null | default `now()` |

Index: `(lower(trim(company_name)), door_type)` for the resume lookup.

### `ecovadis_submissions`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | default `gen_random_uuid()` |
| respondent_id | uuid, not null | FK → `respondents(id)` on delete cascade |
| file_url | text, not null | Storage path within the `submissions` bucket |
| uploaded_at | timestamptz, not null | default `now()` |

### `questionnaire_submissions`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | default `gen_random_uuid()` |
| respondent_id | uuid, not null, **unique** | FK → `respondents(id)` on delete cascade — one row per respondent, upserted |
| mode | text, not null | `excel_upload` \| `online` |
| file_url | text, null | Storage path, when mode = excel_upload |
| responses | jsonb, null | Answer object keyed by field name, when mode = online |
| updated_at | timestamptz, not null | default `now()`, bumped on every progressive save |

## Storage

Bucket `submissions` — private (`public: false`), 10MB file size limit, allowed
MIME types: `application/pdf`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.
Objects are keyed `<respondent_id>/<prefix>-<timestamp>-<filename>`.

## RLS and access model

`respondents` has **no direct anon grants at all** (`revoke all ... from anon`).
"Update only your own row, matched by company_name/contact_email" cannot be
expressed as a plain RLS policy for an unauthenticated role — there is no
session identity to check a `USING` clause against. Instead, every mutation on
this table goes through `SECURITY DEFINER` functions that internally bypass
RLS but only ever touch or return the one row relevant to the caller's input:

- `capture_respondent(company_name, contact_name, contact_email, door_type)` — normalizes and looks up an existing row for that company+door; updates contact fields and returns it if found, otherwise inserts a new `in_progress` row. This is how the capture step resumes-or-creates without anon ever getting a table-wide SELECT.
- `mark_respondent_complete(respondent_id)` — sets status = complete.
- `get_questionnaire_progress(respondent_id)` — returns the caller's own `questionnaire_submissions` row (for resume pre-fill), since anon has no SELECT grant on that table either.

The UUID `id` returned by `capture_respondent` is the de facto capability
token for the rest of that visit — unguessable, never listable (no anon
SELECT anywhere), held only in the browser's JS state for that page load.

**`ecovadis_submissions` and `questionnaire_submissions` also have no direct
anon grants at all** (added in migration_002, after the original design —
direct anon INSERT/UPDATE policies — turned out to be broken: supabase-js's
default insert/upsert asks PostgREST to return the written row, which
requires a SELECT policy to authorize; since neither table has one (anon
must not be able to list other companies' submissions), every direct write
failed RLS with "new row violates row-level security policy" even though
the INSERT/UPDATE policies themselves were correct. Fixed by moving writes
into RPCs, same as respondents):
- `save_ecovadis_submission(respondent_id, file_url)` — inserts one row.
- `save_questionnaire_submission(respondent_id, mode, file_url, responses)` — upserts by `respondent_id` (insert or update).

Storage `submissions` bucket: anon may INSERT (upload) only. All reads (team
view, signed URLs) go through the Netlify Functions below using the service
role key, which bypasses RLS/storage policies entirely.

**Team access to all three tables and to file contents is only ever through
Netlify Functions using `SUPABASE_SERVICE_ROLE_KEY`** — never a public anon
SELECT:
- `netlify/functions/team-submission.js` — reads one respondent + its submission, generates a 1-hour signed Storage URL if a file is involved. Backs `team-view.html`.

The weekly reminder function (`weekly-reminder.js`) and the submission-complete
notification (`notify-submission.js`) were removed on 2026-09-09 — the builder
chose not to set up Resend. `last_reminder_sent_at` stays in the schema
(nullable, harmless) but nothing writes to it. See CLAUDE.md's Arms section
for how to restore either arm later.

## Notes for future sessions

- If a future build adds login, `respondents.user_id` is already there and nullable — wire it up without a schema change.
- The `submissions` bucket path convention (`<respondent_id>/<prefix>-<timestamp>-<filename>`) is assumed by `team-submission.js`'s filename display (last path segment) — keep it if you change the upload code in index.html.
- `questionnaire_submissions.respondent_id` is UNIQUE by design (one row per respondent, upserted) — if a future version needs submission history, this would need to change to an insert-only log table instead.

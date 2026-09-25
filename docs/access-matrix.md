# Access Matrix — Sustainable Suppliers Dashboard — Internal Use Only

**Written against:** product-spec.md v1.1 · supabase-setup.md as of 2026-09-16 (Session 1; database stage complete and live)
**Population pattern:** P2 — internal only, for this tool's own tables (`submission_reviews`, `user_roles`). The three tables this tool reads (`respondents`, `ecovadis_submissions`, `questionnaire_submissions`) keep the P1 anon rules already established by the sibling Supplier Engagement Portal — documented here for the shared-database picture, never redefined.
**Date:** 25 September 2026
**Author:** Valentina
**Status:** Confirmed
**Companion file:** user-stories.md

> The source of truth for who may do what in this tool. The Project Governor lifts Section 7
> into CLAUDE.md. Claude Code builds the `user_roles` table and every line of Section 6 with
> the mechanism that line names, extending the login that already exists rather than building
> it from scratch. The screen test, as each named person, triggers every `no` and every `own`
> in Section 1. Section 6 of product-spec.md (the single-run RLS-grid fallback, written when
> this skill was unavailable) is now superseded by this file.
>
> Every cell names a real table and one of the seven actions. Export never exceeds read.

---

## 1. The matrix

Legend: `yes` = all rows · `own` = rows the role owns (Section 2) · `no` = refused, in the
database, not only in the screen · `—` = not applicable to this table.

Actions are always these seven, in this order: create, read, update, change state, delete,
export, maintain lists.

### submission_reviews

One row = one supplier's current manual review label. No row is ever frozen: `review_status`
stays editable by whoever the matrix grants write to, regardless of its value — including the
row named `final_submission`, which is a working label, not a document. This is a deliberate
deviation from the generic "final row is frozen" default (there is no document here to freeze).

| Action | Administrator | Reviewer | User | no role | anon |
|---|---|---|---|---|---|
| create | yes | yes | no | no | no |
| read | yes | yes | yes | yes | no |
| update | yes | yes | no | no | no |
| change state | — (folded into update; see note above) | — | — | — | — |
| delete | no | no | no | no | no |
| export | no (not built) | no | no | no | no |
| maintain lists | — (not a lookup table) | — | — | — | — |

### user_roles

One row = one team member's assigned role. No row is ever frozen; a role can always be
changed by an Administrator.

| Action | Administrator | Reviewer | User | no role | anon |
|---|---|---|---|---|---|
| create | yes (any user, including own row) | no | no | no | no |
| read | yes (all rows) | own row only | own row only | own row only | no |
| update | yes (any user, including own row) | no | no | no | no |
| change state | — n/a | — | — | — | — |
| delete | no | no | no | no | no |
| export | no | no | no | no | no |
| maintain lists | — n/a | — | — | — | — |

### respondents / ecovadis_submissions / questionnaire_submissions (read-only reference — owned by Supplier Engagement Portal)

This tool never writes to these tables. Rows here document the existing, unchanged rules so
the matrix reads as one shared-database picture; see docs/supabase-setup-portal.md for the
sibling tool's own schema and its `anon` policies, which this file does not redefine.

| Action | Administrator | Reviewer | User | no role | anon |
|---|---|---|---|---|---|
| create | no | no | no | no | `ecovadis_submissions`, `questionnaire_submissions`: yes, through the sibling's own submit function only. `respondents`: no (created by the sibling's `capture_respondent` function) |
| read | yes (all rows) | yes (all rows) | yes (all rows) | yes (all rows) | no |
| update | no | no | no | no | no |
| delete | no | no | no | no | no |
| export | no | no | no | no | no |

---

## 2. Ownership

- **submission_reviews**: no per-row ownership. Write access is granted by role
  (Administrator, Reviewer), never by who created or last touched the row. There is no
  `created_by` column and none is added by this iteration — unchanged from the tool's live
  v1.0 design, where every team member already shared identical write access.
- **user_roles**: a row belongs to the team member named in `user_id` (their `auth.users`
  identity). Ownership never transfers. Only an Administrator may write any row, including
  their own; a non-Administrator may only read their own row.
- **respondents / ecovadis_submissions / questionnaire_submissions**: ownership is defined
  and enforced entirely by the sibling tool. This tool has read-only access to every row
  regardless of who submitted it.

---

## 3. The people

| Role | Named first holder | Layer | Screens |
|---|---|---|---|
| Administrator | Valentina Lucchini, lucchini.v@gmail.com — real, already logged in | business + role-carried admin (`role = administrator` in `user_roles`) | Summary, Red Flags, Suppliers Table, Supplier Detail, Manage Users |
| Reviewer | Revisore Pilota (placeholder), lucchini.v+revisore@gmail.com — stand-in until a real second team member is invited | business | Summary, Red Flags, Suppliers Table, Supplier Detail |
| User | Utente Pilota (placeholder), lucchini.v+utente@gmail.com — stand-in until a real third team member is invited | business | Summary, Red Flags, Suppliers Table, Supplier Detail (read-only) |
| no role | any newly invited Supabase account with no `user_roles` row yet | business (degraded — reads like User, writes nothing) | same screens as User |
| platform owner | Valentina Lucchini | outside the app | Supabase, Netlify dashboards |

Unlike the generic template, there is no separate `profiles` table and no admin flag on a
profile: the role enum in `user_roles` itself carries `administrator` as one of its three
values, since identity for this tool is `auth.users` (read server-side only, via the existing
service-role pattern) plus `user_roles`.

Admin actions, fixed to this tool's actual scope (narrower than the skill's generic four,
since there are no lists, no documents to withdraw and no personal data to anonymise here):
**assign or change any team member's role** (create/update any `user_roles` row, including
their own) and **read everything**. Inviting a new person stays a deliberate Supabase-dashboard
action, by the builder's explicit choice (product-spec.md Section 12) — Manage Users only
assigns roles to already-invited accounts.

The public-facing tool (Supplier Engagement Portal) has the `anon` column and no business
role of its own — external suppliers, no login. This tool (the Dashboard) has Administrator,
Reviewer and User and no `anon` column of its own. One shared database; the read-only tables
above are documented together here for that reason.

---

## 4. Exceptions (column-level, not built at the access stage)

None identified for this version. No column needs hiding from any role that can already read
the table it lives in.

---

## 5. Schema delta (what this iteration adds to supabase-setup.md, in one pass with the role check)

| Table | Add | Why |
|---|---|---|
| `user_roles` (new) | `user_id` (uuid, FK to `auth.users`, unique, not null), `role` (enum: `administrator` / `reviewer` / `user`, not null, no default), `updated_at` (timestamptz, default `now()`) | ties an already-invited Supabase Auth identity to one of the three roles; no row = no role, treated as User for read per product-spec.md Section 9 |

No new columns on `submission_reviews` — its existing `using (true)` / `with check (true)`
policies from v1.0 are replaced by role-checked policies (Section 6 below); the table itself
is unchanged.

No `profiles` table is added. `auth.users` (email, id) is the identity source for Manage
Users, read server-side only, via a new Netlify Function extending the pattern already used
by `signed-file-url.js` (service-role key, never sent to the browser), gated on the caller's
own `user_roles.role = administrator`.

**Seed:** Valentina's own row (`auth.users` id → `role = administrator`) is created as part of
this migration, since her account already exists and must not become a "no role" account
mid-migration. Revisore Pilota and Utente Pilota are **not** seeded — they get real
`user_roles` rows only once actually invited via the Supabase dashboard and assigned a role
by the Administrator through Manage Users, exactly as the live product will work.

---

## 6. Policy plan (extending the existing login with the role check; one line per `own` and per `no`)

| # | Table | Action | Role | Rule in words | Mechanism | Screen test |
|---|---|---|---|---|---|---|
| 1 | submission_reviews | read | Administrator, Reviewer, User, no role | all rows | policy (SELECT) | Utente Pilota opens the Suppliers Table and sees every review status |
| 2 | submission_reviews | create, update | Administrator, Reviewer | any row, no ownership check — only a role check against `user_roles` | policy (INSERT, UPDATE) using a helper that reads the caller's role | Revisore Pilota changes a supplier's Review Status and it saves and shows on reload for everyone |
| 3 | submission_reviews | create, update | User, no role | refused | policy (default deny — role check fails) | Utente Pilota has no editable control; a direct API attempt to update is refused, not just hidden |
| 4 | submission_reviews | delete | everyone | no policy (default deny) | none | no delete works from any account |
| 5 | user_roles | read | any authenticated user | own row only (`user_id = auth.uid()`) | policy (SELECT) | Utente Pilota reads their own row; a row belonging to someone else is not returned |
| 6 | user_roles | read | Administrator | all rows | policy (SELECT), widened by the role-check helper | Valentina opens Manage Users and sees every row |
| 7 | user_roles | create, update | Administrator | any row, any `user_id`, including their own — a single admin must be able to change their own row, since blocking self-edit would risk a lockout only the Supabase dashboard could recover from | policy (INSERT, UPDATE) | Valentina assigns Revisore Pilota's role from Manage Users and it saves |
| 8 | user_roles | create, update | Reviewer, User, no role | refused, including their own row | policy (default deny for non-Administrator) | Revisore Pilota cannot change their own role even via a direct API call |
| 9 | user_roles | delete | everyone | no policy (default deny) | none | no delete works from any account |
| 10 | respondents, ecovadis_submissions, questionnaire_submissions | read | Administrator, Reviewer, User, no role | all rows (unchanged from v1.0) | policy (SELECT), already live | Utente Pilota opens Supplier Detail and sees the same data as before |
| 11 | respondents, ecovadis_submissions, questionnaire_submissions | create, update, delete | every authenticated role | refused — this tool is read-only here, unchanged from v1.0 | no policy | no team member of any role can write to these tables |
| 12 | submission_reviews, user_roles | any | anon | nothing: no policy and no table grant | none (default deny) | a logged-out visitor reading either table via the API gets a permission error, not an empty list |
| 13 | Manage Users' account listing (`auth.users`) | read | Administrator only | a server-side function checks the caller's session, then their `user_roles.role = administrator`, before returning the invited-account list | function (Netlify Function, service role key) | Revisore Pilota calling the function directly with their own valid session is refused; Valentina gets the full list |
| 14 | own password | update | any signed-in user | unchanged from v1.0 — the Change/forgot-password screens, `auth.updateUser`, own account only | Supabase Auth | any of the three named people changes their own password; nobody can change another's |

Default deny applies to every table: where no line above says yes, the answer is nothing. A
helper (`current_user_role()`, reading the caller's row in `user_roles`) returns `null` when
absent, and every policy above checks it — so "no role" behaves as an implicit fourth column
(reads like User, writes nothing), never a crash and never an implicit admin grant, per
product-spec.md Section 9.

**The gate.** Half A (Claude Code, during the build): every `no` cell and the `user_roles`
"own row" boundary attempted through the API as each named person's session and as a
logged-out visitor, with the result pasted into PROGRESS.md under "Refusal test record"
before deploy. Half B (the named people): every test in this table run as the named person on
the screen — for Reviewer and User this means Valentina logging in as Revisore Pilota and
Utente Pilota respectively, recorded in PROGRESS.md as "tested via placeholder, pending a
real second/third team member." Any later change to a rule re-runs both halves before the push.

---

## 7. Hard rules for CLAUDE.md (the Governor lifts these verbatim)

1. The refusal happens in the database (RLS) or in a server function holding the service role
   key (the Manage Users listing), never only in the screen. RLS stays enabled on every
   table, including the new `user_roles`, and is never disabled to make something work.
   `anon` has no policy and no table grant on `submission_reviews` or `user_roles`.
2. No Reviewer, User or no-role account can change any row in `user_roles`, including their
   own — a policy refuses every write from a non-Administrator. An Administrator may change
   any row, including their own; with a single Administrator today, blocking self-edit would
   risk a lockout only recoverable from the Supabase dashboard, so it is deliberately allowed.
3. Neither `submission_reviews` nor `user_roles` has a frozen or final row in this version —
   both stay editable by whoever the matrix grants write to, for as long as the tool exists in
   this form. (Explicit deviation from the general "final state is frozen" default — there is
   no document here to freeze.)
4. Nothing is deleted through the app. No `DELETE` policy exists on `submission_reviews` or
   `user_roles`. Access is removed by changing a role (or leaving an account at "no role"),
   never by deleting its row; removing a person's Supabase Auth account entirely is a manual,
   out-of-app action and orphans their `user_roles` row, accepted for this version.
5. `submission_reviews` and `user_roles` both carry `updated_at`; neither carries
   `created_by`, since neither table has per-row ownership — write access is controlled by
   role membership, not by row authorship.

---

## 8. Handover paragraph (for the handover package, plain language)

Sustainable Suppliers Dashboard now has three kinds of signed-in user, all set from one
place. Administrator (Valentina Lucchini) sees and can change everything, and is the only one
who can open Manage Users to assign or change anyone's role, including her own. Reviewer
(first real holder not yet named — a placeholder is used for testing) sees everything and can
update a supplier's Review Status, identical to what every team member could do in v1.0.
User (first real holder not yet named — a placeholder is used for testing) sees everything,
but Review Status is plain text, not a control, and any attempt to change it is refused by the
database itself, not just hidden by the screen. A newly invited person with no role yet can
sign in and read everything, exactly like a User, until the Administrator assigns them a real
role. Nothing is ever deleted: access is removed by changing a role, not by deleting a record.
The rules are enforced in the database itself (Row-Level Security), so they hold regardless of
which screen or tool reaches the data. The Supabase and Netlify accounts are held by Valentina
personally; moving them to a company account changes nothing in the rules. This tool shares
its database with the public Supplier Engagement Portal — that tool's own anonymous-submission
rules are untouched by anything here.

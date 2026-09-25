# User Stories — Sustainable Suppliers Dashboard — Internal Use Only

**Written against:** product-spec.md v1.1 · supabase-setup.md as of 2026-09-16 (Session 1)
**Date:** 25 September 2026
**Author:** Valentina
**Status:** Confirmed
**Population pattern:** P2 — internal only, for this tool's own tables. The three
sibling-owned tables keep their existing P1 rules, documented not redefined (see
access-matrix.md).
**Companion file:** access-matrix.md (every story below cites exactly one cell of it:
`[table · action · role]`, one of the seven actions; a story needing two cells is two stories)

> Reviewer and User are placeholders as of this run — no second or third team member has been
> invited yet (product-spec.md Section 15). Replace with the real name and work email the
> first time each is actually invited, and re-run the refusal tests below as that real person.

---

## The people

| Role | Named first holder | Layer | Opens |
|---|---|---|---|
| Administrator | Valentina Lucchini, lucchini.v@gmail.com — real, already logged in | business + role-carried admin | Summary, Red Flags, Suppliers Table, Supplier Detail, Manage Users |
| Reviewer | Revisore Pilota (placeholder), lucchini.v+revisore@gmail.com | business | Summary, Red Flags, Suppliers Table, Supplier Detail |
| User | Utente Pilota (placeholder), lucchini.v+utente@gmail.com | business | Summary, Red Flags, Suppliers Table, Supplier Detail (read-only) |
| no role | any newly invited account before a role is assigned | business (degraded) | same screens as User |
| platform owner | Valentina Lucchini | outside the app | Supabase and Netlify dashboards |

Administrator and Reviewer have identical data permissions (both edit Review Status);
Administrator's only distinguishing capability is Manage Users. There is no separate
`profiles` table in this tool — identity is `auth.users` plus `user_roles`.

---

## Stories by role and screen

### Administrator — Manage Users

- **As Administrator, I see every invited team member with their current role or "No role assigned", so that I know who has access to what.** `user_roles · read · Administrator`
  Acceptance: Valentina opens Manage Users and sees every invited Supabase account, including one not yet in `user_roles`, labelled "No role assigned".
- **As Administrator, I assign or change a team member's role, so that access follows who's actually doing what.** `user_roles · create/update · Administrator`
  Acceptance: Valentina sets Revisore Pilota's role to Reviewer; the change saves immediately and is visible on reload; Revisore Pilota's next page load reflects the new permissions.
- **As Administrator, I may change my own role, including my own row, so that a single admin is never permanently locked out of that decision.** `user_roles · update (own row) · Administrator`
  Acceptance: Valentina's own row can be changed the same way as anyone else's; if she ever did demote herself, recovery would go through the Supabase dashboard, not the app.
- **As Administrator, I cannot invite a new person from this screen, so that inviting stays a deliberate Supabase-dashboard action.** `— (no invite control on this screen, by design)`
  Acceptance: Manage Users has no "add user" button; a new account only appears here after being invited directly in Supabase.

### Administrator, Reviewer — Suppliers Table, Supplier Detail

- **As Administrator or Reviewer, I change a supplier's Review Status, so that the team's manual assessment stays current.** `submission_reviews · create/update · Administrator, Reviewer`
  Acceptance: Revisore Pilota opens the Suppliers Table, changes a Review Status dropdown, and the new value shows immediately and on reload for everyone, including Valentina and Utente Pilota.

### User — Suppliers Table, Supplier Detail

- **As User, I see every supplier's Review Status as plain text, so that I stay informed without being able to change the team's assessment.** `submission_reviews · read · User`
  Acceptance: Utente Pilota opens the Suppliers Table and Review Status shows as text, not a dropdown.
- **As User, I cannot change a Review Status, so that only Administrator or Reviewer can affect the shared assessment.** `submission_reviews · create/update · User` (= no)
  Acceptance: Utente Pilota has no editable control; a direct API call attempting the update is refused by the database, not just hidden by the screen.

### Reviewer, User, no role — Manage Users (refused)

- **As Reviewer, User, or an account with no role, I cannot open Manage Users or list other accounts, so that role assignment stays with the Administrator alone.** `user_roles · read (all rows) · Reviewer/User/no role` (= no)
  Acceptance: Revisore Pilota's navigation has no Manage Users link; loading its URL directly shows nothing; a direct API call for all `user_roles` rows returns only their own row, never the full list; a direct call to the account-listing function is refused.

### no role — every screen

- **As a newly invited account with no role yet, I can sign in and read everything, so that I'm not fully locked out the moment I'm invited.** `submission_reviews, respondents, ecovadis_submissions, questionnaire_submissions · read · no role`
  Acceptance: a freshly invited Supabase account with no `user_roles` row signs in and sees Summary, Red Flags, Suppliers Table and Supplier Detail exactly as a User would.
- **As a newly invited account with no role yet, I cannot change anything, so that an unassigned account can't act before the Administrator decides its role.** `submission_reviews · update · no role` (= no)
  Acceptance: the account has no editable controls anywhere; a direct API attempt to update a Review Status is refused.

### Administrator — everything

- **As Administrator, I read every table this tool owns, so that I can support any user.** `submission_reviews · read · Administrator`, `user_roles · read · Administrator`
  Acceptance: Valentina opens each screen and sees every row, regardless of who set it or which role it belongs to.
- **As Administrator, Reviewer or User, I still only ever read the sibling portal's data — I never create, edit or delete a respondent, EcoVadis file or questionnaire answer, so that this tool stays read-only on data it doesn't own.** `respondents, ecovadis_submissions, questionnaire_submissions · create/update/delete · any role` (= no)
  Acceptance: no screen in this tool has a form for any of these three tables; a direct API write attempt by any of the three named people is refused.

---

## Stories that are refusals (collected)

The screen test list once the role check is on. One line per `no` in the matrix.

| # | Who | Tries | Result | Cell |
|---|---|---|---|---|
| 1 | Utente Pilota (User) | change a supplier's Review Status via a direct API call | refused, not just hidden | `submission_reviews · update · User` |
| 2 | Revisore Pilota (Reviewer) | open Manage Users, or call its listing function directly | refused / no data returned | `user_roles · read (all) · Reviewer` |
| 3 | any no-role account | change anything, or read Manage Users' listing | refused | `submission_reviews · update · no role`; `user_roles · read (all) · no role` |
| 4 | anyone, any role | delete a row in `submission_reviews` or `user_roles` | no delete anywhere | `submission_reviews · delete · role`; `user_roles · delete · role` |
| 5 | Revisore Pilota or Utente Pilota | change their own role in `user_roles` | refused | `user_roles · update (own row) · Reviewer/User` |
| 6 | a logged-out visitor | read `submission_reviews` or `user_roles` via the API | permission error, not an empty list | every table this tool owns · read · anon |
| 7 | any of the three named people | write to `respondents`, `ecovadis_submissions` or `questionnaire_submissions` | refused — this tool is read-only here | see matrix Section 1 |

---

## Later list (not this version)

- Real named Reviewer and User (placeholders in use until the Administrator invites the second and third team member)
- In-app invitation of new users — deliberately deferred; invite stays a Supabase-dashboard action
- Restricting which suppliers a role can see — all roles see all suppliers in this version
- Any withdraw/reinstate/anonymise mechanism for `submission_reviews` or `user_roles` — no personal data, no document to withdraw, out of scope per product-spec.md Section 7

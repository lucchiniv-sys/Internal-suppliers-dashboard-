-- Discovered during the v1.1 refusal-test gate: submission_reviews (owned by
-- this tool) had full table grants (SELECT/INSERT/UPDATE/DELETE/...) to anon,
-- left over from the original v1.0 migration. RLS already blocked anon writes
-- (no anon-targeted policy exists), so this was not exploitable, but it
-- contradicts product-spec.md, docs/access-matrix.md and CLAUDE.md Hard Rule 1
-- ("anon has no policy and no table grant on submission_reviews"). Revoking to
-- match the documented, intended state. Does not touch any sibling-owned
-- table — confirmed respondents/ecovadis_submissions/questionnaire_submissions
-- carry no anon grant at all.
revoke all on public.submission_reviews from anon;

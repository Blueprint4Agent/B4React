# Commit Title

ci(governance): enforce PR workflow and committed worklogs

# Changed File Scope

Agent guide, workflow documentation/templates, governance scripts, Makefile and PR CI.

# Reason

Make the documented branch/worklog/PR workflow enforceable in both repositories.

# Design

Start a named branch before writing the worklog plan. Validate staged content locally
and each non-merge commit in the PR range in CI. Read PR metadata from the event JSON.
Require PRs and named checks on main after the checks are available.

# Verification Plan

Run the repository Make checks and governance check on the staged snapshot.
Observe PR governance and existing CI checks before requiring them on main.

# Impact

Untracked worklogs and empty headings no longer satisfy commit checks. Each authored
commit needs a matching worklog title. PR metadata edits trigger governance again.
Existing runtime behavior and API contracts are unchanged.

# Loop Alignment

Backend request/event/task and frontend API/realtime/connectivity/UI loops are not
applicable: this change only affects development workflow and repository policy.

# Verification

- make check and make build passed.
- Staged governance validation is required immediately before commit.
- Local tests not run; existing PR CI retains automated tests.
- Versioned main ruleset will be applied after this PR emits its named checks.

# Agent Guide

Read `AGENTS.md`, then `FRONTEND.md`, then `TEST.md` when changing tests.

B4React is an independent frontend consumed by backend repositories as a pinned Git submodule.
Do not read or write a parent repository as part of install, generation, checking, testing, or building.
Use `contracts/openapi.json` as the local API contract. Regenerate with `make api-generate` and verify with `make api-check`.

## Verification and documentation

Run `make verify-plan` then `make verify` before committing. The default HEAD comparison includes staged, unstaged and untracked edits; set VERIFY_BASE to review the entire branch. Docs/structurally unchanged locale copy use text/JSON validation; behavior uses check/test/build, UI adds test-ui, and protected/unknown changes use full verification. `VERIFY_FULL=1 make verify` escalates. See [verification policy](notes/verification.md). Do not repeat successful checks for unchanged content, including delegated parent checks. Record selected/omitted checks; keep related edits in one task PR and read failure-focused logs. Required governance and merge protections remain unchanged. Keep English and Korean documentation under `notes/ko/` synchronized. Review API state, realtime refresh, desktop recovery, and UI composition loops in `FRONTEND.md`; record non-applicable loops and reasons in the worklog.

## Git governance

Use `<type>/<kebab-description>` branches and Conventional Commit titles. Each new commit must include `worklog/NNNN-description.md` with `# Commit Title`, `# Changed File Scope`, `# Reason`, `# Impact`, and verification results. Non-trivial commit bodies must include `Changes:`, `Affected Files:`, and `Verification:`.

Validate planned metadata using `make git-governance-check` with COMMIT_TITLE, COMMIT_BODY_FILE, PR_TITLE and PR_BODY_FILE as needed. PR titles use `[type] Description`. PR descriptions require Summary, Scope, Reason, Verification, Documentation, and Risk / Impact sections. Create ready PRs by default. Use merge commits, including `gh pr merge --auto --merge`, and verify the registered auto-merge method. Squash/rebase require an explicit user request.

Historical commits were imported with `git subtree split` from B4FastAPI; worklog requirements apply to new commits in this repository.

## Task Start and Completion Order

1. Read the applicable guides and inspect working tree/submodule status; preserve unrelated edits.
2. Create a named task branch from the current target branch before implementation.
3. Copy `.github/WORKLOG_TEMPLATE.md` to the next `worklog/NNNN-description.md`.
   Fill in the intended commit title, reason, scope, design, verification plan and loop impact
   before editing implementation. Record actual outcomes in Verification before committing.
4. Implement and synchronize related documentation. Update the plan if scope changes.
5. Run the applicable root Make checks. Record skipped checks and reasons for this task;
   an earlier test-skip request must not silently become a permanent exemption.
6. Stage the intended files including the completed worklog, then run
   `COMMIT_TITLE='type(scope): summary' COMMIT_BODY_FILE=/tmp/commit.txt make git-governance-check`.
   Planned validation reads the Git index, not untracked or unstaged content. Run it again after staging changes.
7. Commit, push and create a ready PR. Validate PR_TITLE and PR_BODY_FILE together.
8. Wait for required Git governance and code checks before merge; verify MERGE auto-merge registration.

The worklog template requires Design, Verification Plan, Loop Alignment and Verification
in addition to the existing four sections. Each authored commit must add/modify a worklog
whose Commit Title exactly matches that commit. Merge commits used to integrate branch
history are excluded from per-commit checks; changes must be authored in ordinary commits.
Start-time planning is a human/agent obligation: Git cannot prove when a plan was written.
CI enforces committed evidence, nonempty sections and metadata, not design correctness.

## PR Governance Enforcement

`make git-governance-pr-check` reads the GitHub PR event via GITHUB_EVENT_PATH, checks
branch/title/body, and validates every non-merge commit in base SHA..head SHA using
its committed files. The dedicated Git governance workflow fetches full history and
runs again on PR metadata edits. A local check without COMMIT_TITLE checks HEAD.
The validator uses Python 3 (standard library only); the shell entry point is retained.

Main policy: PR required, Git governance plus repository code checks required, deletion
and force-push blocked. Approval count is zero to support solo maintenance; CI passing
does not imply human review. Merge commit is the default, and alternate methods still
require the user's explicit instruction. Required status contexts must match actual job names.

The desired ruleset is versioned in `.github/main-ruleset.json`. Apply it through
GitHub Rulesets after the named CI jobs exist, preserving existing required checks.
PR conversations must be resolved before merging. Ruleset changes require repository
administration permission; do not bypass checks when that permission is unavailable.

## Shared UI harness

`make check` and `make architecture-check` include `make ui-composition-check`. Add a rendered showcase example whenever exporting a shared UI value. Keep appearance in `src/styles/app.css`; reuse Button instead of copying its classes. Inline geometry exceptions must be narrowly recorded in the checker and the frontend guide. Review catalog coverage and mobile layout when changing shared controls.

## React optimization (default workflow)

Read [state and performance decisions](notes/react-performance.md) before runtime or state-library changes. Establish state ownership first; use React.memo by default at expensive/repeated child boundaries with frequently unchanged props, stable references where useful, and explicit reasons when not applicable. Do not blanket-wrap components or introduce Zustand/Redux without a demonstrated need. Independent optimizations use separate branches/worklogs/PRs.

For runtime/dependency changes, fill State Ownership, Memoization and Performance Evidence in the worklog before implementation and replace planned evidence with actual results. Git governance enforces these sections from the same staged/committed snapshot. `make react-performance-check` is included in check/architecture-check; `make test` protects skipped work and necessary updates; run `make test-routes` for routing/build changes and `make test-ui` for UI changes. Required CI includes production route recovery. Inspect guard failures and update evidence when intentionally changing a protected boundary; do not disable checks merely to pass.

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
8. Confirm local hook checks and actual PR metadata validation before merge; use merge commits and verify MERGE if auto-merge is registered.

The worklog template requires Design, Verification Plan, Loop Alignment and Verification
in addition to the existing four sections. Each authored commit must add/modify a worklog
whose Commit Title exactly matches that commit. Merge commits used to integrate branch
history are excluded from per-commit checks; changes must be authored in ordinary commits.
Start-time planning is a human/agent obligation: Git cannot prove when a plan was written.
Local governance enforces committed evidence, nonempty sections and metadata, not design correctness.

## Local Governance and Manual GitHub Workflows

Install versioned hooks once per clone with `make hooks-install` (also part of `make init`).
The parent installs hooks in its initialized frontend submodule too. Existing custom
core.hooksPath settings are preserved and require explicit reconciliation.

`commit-msg` checks the actual message and staged matching worklog. Integration merge
commits are excluded. `pre-push` requires a clean working tree/submodule and the exact
checked-out HEAD, fetches remote main, checks every authored commit since its merge base,
and runs `make verify-plan` then `make verify` against that full branch range. A failed
check blocks the push. Do not bypass hooks to complete ordinary tasks.

After creating or editing PR metadata run `PR_NUMBER=<number> make git-governance-pr-check`.
This reads the actual GitHub title/body and verifies the complete commit range locally.
Planned PR validation with PR_TITLE/PR_BODY_FILE remains available. Rerun the actual PR
check immediately before merge; metadata edited on GitHub cannot trigger a local hook.

GitHub workflows are workflow_dispatch-only, including image/desktop builds; no automatic
PR, push, schedule, tag or release runs. Main still requires a PR, resolved conversations,
and protects deletion/non-fast-forward updates, with zero required approvals. Required
status checks are removed from `.github/main-ruleset.json` and the live ruleset. Use merge
commits by default. Local hooks are bypassable and are not a server-side CI guarantee.
Do not disable PR or history protection. Apply ruleset changes only with repository admin
permission; never bypass unavailable permissions.

Successful Make command receipts are local and content-bound for at most 24 hours.
Only unchanged code/docs/config, tool/environment context and required build outputs
permit reuse; worklog-only outcome edits still receive text and governance validation.
CI/manual Actions and VERIFY_FULL=1 ignore receipts. See notes/local-hooks.md.

## Shared UI harness

`make check` and `make architecture-check` include `make ui-composition-check`. Add a rendered showcase example whenever exporting a shared UI value. Keep appearance in `src/styles/app.css`; reuse Button instead of copying its classes. Inline geometry exceptions must be narrowly recorded in the checker and the frontend guide. Review catalog coverage and mobile layout when changing shared controls.

## React optimization (default workflow)

Read [state and performance decisions](notes/react-performance.md) before runtime or state-library changes. Establish state ownership first; use React.memo by default at expensive/repeated child boundaries with frequently unchanged props, stable references where useful, and explicit reasons when not applicable. Do not blanket-wrap components or introduce Zustand/Redux without a demonstrated need. Independent optimizations use separate branches/worklogs/PRs.

For runtime/dependency changes, fill State Ownership, Memoization and Performance Evidence in the worklog before implementation and replace planned evidence with actual results. Git governance enforces these sections from the same staged/committed snapshot. `make react-performance-check` is included in check/architecture-check; `make test` protects skipped work and necessary updates; run `make test-routes` for routing/build changes and `make test-ui` for UI changes. Local full verification includes production route recovery. Inspect guard failures and update evidence when intentionally changing a protected boundary; do not disable checks merely to pass.

For every UI change, follow [page-family consistency](notes/page-families.md): select an existing peer before implementation, reuse its composition rules, record Page Family review in the worklog, and compare actual peer layouts before committing. Shared controls alone do not establish consistency.

# Agent Guide

Read `AGENTS.md`, then `FRONTEND.md`, then `TEST.md` when changing tests.

B4React is an independent frontend consumed by backend repositories as a pinned Git submodule.
Do not read or write a parent repository as part of install, generation, checking, testing, or building.
Use `contracts/openapi.json` as the local API contract. Regenerate with `make api-generate` and verify with `make api-check`.

## Verification and documentation

Run `make check`, `make test`, and `make build` before committing. Keep English and Korean documentation under `notes/ko/` synchronized. Review API state, realtime refresh, desktop recovery, and UI composition loops in `FRONTEND.md`; record non-applicable loops and reasons in the worklog.

## Git governance

Use `<type>/<kebab-description>` branches and Conventional Commit titles. Each new commit must include `worklog/NNNN-description.md` with `# Commit Title`, `# Changed File Scope`, `# Reason`, `# Impact`, and verification results. Non-trivial commit bodies must include `Changes:`, `Affected Files:`, and `Verification:`.

Validate planned metadata using `make git-governance-check` with COMMIT_TITLE, COMMIT_BODY_FILE, PR_TITLE and PR_BODY_FILE as needed. PR titles use `[type] Description`. PR descriptions require Summary, Scope, Reason, Verification, Documentation, and Risk / Impact sections. Create ready PRs by default. Use merge commits, including `gh pr merge --auto --merge`, and verify the registered auto-merge method. Squash/rebase require an explicit user request.

Historical commits were imported with `git subtree split` from B4FastAPI; worklog requirements apply to new commits in this repository.

# B4React

Shared React + TypeScript frontend for compatible B4 API providers. The source history
was extracted from B4FastAPI's `src/frontend` with `git subtree split`.

[한국어](notes/ko/README.md) · [Engineering guide](FRONTEND.md) · [Test guide](TEST.md)

## Development

Use Node.js 24 and npm. From this repository:

```sh
make install init
make dev
make check test build
```

Vite runs on port 5173. Set `VITE_API_BASE_URL` in `.env` for your backend.
The default development API port is 8000; other web builds use the current origin.
A Spring Boot provider on port 8080 needs `VITE_API_BASE_URL=http://localhost:8080`
and must implement the same [API contract](contracts/README.md), including auth and SSE behavior.
Cross-origin deployments require backend CORS and cookie configuration.

## Contract and builds

`contracts/openapi.json` is a committed snapshot; `contracts/source.json` records its origin.
`make api-generate` generates `src/api/generated/openapi.ts`; `make api-check` detects drift.
Generation never fetches a running backend and never reads a parent repository.
`build:sync` and `build:strict` are compatibility aliases that regenerate from this local snapshot.

`make build` writes only `dist/`. A consuming backend owns static-file packaging.
In B4FastAPI, `make frontend-package` builds and copies the result into the backend;
`make build` includes that packaging step. Independent hosting can deploy `dist/` directly.

## Submodule usage

Backend repositories embed this repository at `src/frontend` and pin a commit:

```sh
git clone --recurse-submodules https://github.com/Blueprint4Agent/B4FastAPI.git
# Existing backend checkout:
git submodule update --init --recursive
```

Develop frontend changes on a named branch in B4React and merge its PR first.
Then update the consuming backend's gitlink in a separate PR and run its contract checks.
Do not use `git submodule update --remote` in CI. Backend and frontend releases are independent.
A backend may keep using an older compatible frontend commit.

## Desktop

`make desktop-dev` and `make desktop-build` require Rust and platform Tauri dependencies.
For packaged apps, set `VITE_API_BASE_URL` to the deployed API origin at build time.
The server must allow the webview origin in its CORS configuration.
The existing B4FastAPI desktop bundle identifier and product name are preserved to
avoid changing installed application identity during extraction. Backend repositories
currently own desktop release workflows. Authentication and data operations require
connectivity; recovery revalidates session/config and restarts realtime subscriptions.

## Contributions

Follow [AGENTS.md](AGENTS.md). Every new commit includes a worklog, with
`make check test build` results. Imported history predates this repository's worklog policy.

## Task workflow and PR checks

Read guides/status → create task branch → draft the [worklog](.github/WORKLOG_TEMPLATE.md)
→ implement → run Make checks → record results and stage files → validate governance
→ commit and open a PR. Record design, verification plan, loop alignment and actual outcomes.

With COMMIT_TITLE, `make git-governance-check` validates the staged snapshot and
COMMIT_BODY_FILE; without it, the command checks HEAD. Supply PR_TITLE and
PR_BODY_FILE together for planned PR validation. Untracked worklogs do not count.
Install local hooks with `make hooks-install` (included in `make init`). Commit messages and
staged worklogs are checked on commit; every outgoing authored commit and change-scoped
verification are checked on push. Actual PR metadata must be checked after edits and before
merge using `PR_NUMBER=<number> make git-governance-pr-check`. Integration merges are excluded.
Main requires PRs and resolved conversations and blocks deletion/force pushes. GitHub CI is
manual-only with no required status checks; zero required approvals remain.
See [local hooks](notes/local-hooks.md) · [한국어](notes/ko/local-hooks.md).

## Architecture checks

Run `make architecture-check` to validate the documented static layer boundaries.
It also runs in `make check` and local verification and optional manual CI. Errors include file/line locations.
Pages/components cannot import runtime APIs; components cannot import runtime domain
hooks. Explicit type-only imports remain legal. Browser HTTP belongs in src/api.
TypeScript resolves aliases/barrels using tsconfig. Indirect wrappers and architectural
state ownership still require review; see FRONTEND.md.

## API Key consistency

API Key UI notifications are best-effort. After a committed create/delete/status
change, Redis/OS/timeout delivery failures are logged without changing the success
response. Publication waits at most two seconds; cancellation and programming
errors still propagate. No durable event outbox/replay is provided.

The frontend useApiKeys hook owns list/mutation state. HTTP and SSE use the same
ID-based updates; server refetches reconcile events and mutation completion.
Connection/reconnection, developer-tab activation and desktop recovery reload the
list. Stale list/account responses are ignored. Modal/input/one-time key state stays
in SettingsPage; tab changes preserve a pending creation result. Background reloads
do not blank an already loaded list. Schema contracts remain unchanged.

Component audit: [English](notes/component-audit.md) · [한국어](notes/ko/component-audit.md).
Shared UI/style coverage: `make ui-composition-check` (also included in `make check`).

State management and React optimization: [English](notes/react-performance.md) · [한국어](notes/ko/react-performance.md). `make react-performance-check` guards the default workflow; `make test-routes` verifies production chunk recovery.

Project identity: copy `project.example.json` to `project.local.json`, edit public
name/short_name/identifier, then run `make project-config-check` and rebuild.
Optional logo paths use files under public/. Generated config and project-brand
assets are ignored by Git; consuming projects must reproduce them in CI.
See the project-local branding section in [the frontend guide](FRONTEND.md).

## Preview and apply local styles

Run `make style-studio` and open `/show-case` on `http://127.0.0.1:5173` (run your backend separately). The compact right panel previews light/dark common colors, radius, fonts and padding in the existing showcase components. On mobile use the Styles button to open it. Review the listed changes and choose **Apply to file** to save the connected local `src/styles/app.css`; **Reset preview** does not write. The editor is opt-in and absent from production. See FRONTEND.md for supported values and backup/conflict behavior.

Search and pagination: [English](notes/collections.md) · [한국어](notes/ko/collections.md).

Change-scoped verification: [English](notes/verification.md) · [한국어](notes/ko/verification.md).

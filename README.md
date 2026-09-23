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

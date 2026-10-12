# Commit Title

fix(frontend): resolve public base path at runtime

# Changed File Scope

Runtime base path configuration, packaged HTML, build/deployment harness and English/Korean documentation.

# Reason

Reuse one monolithic image at multiple public paths without rebuilding.

# Design

Build relative assets; inject a public base element and metadata before scripts execute. Preserve immutable JS/CSS and existing API, session and routing ownership. No database migration.

# Verification Plan

Run focused path tests and the same-image Nginx browser scenario, then make verify-plan and make verify.

# Impact

APP_BASE_PATH and APP_BASE_URL become runtime settings. Existing fixed-path artifacts remain validated. Restart/recreate is required; route changes isolate browser sessions.

# Loop Alignment

Request/static serving remains infrastructure-owned. Existing API, SSE, recovery and UI loops remain intact. No domain mutation or background task is introduced.

# State Ownership

Server-provided document metadata owns immutable deployment configuration. Existing auth/context/storage owners consume it synchronously; no additional store or network fetch.

# Memoization

No new render boundary or expensive repeated child; React.memo is not applicable to URL resolution.

# Performance Evidence

Observed identical entry JavaScript from two containers with the same image ID at different runtime prefixes. Deep routes, reload and existing render/config tests passed. No latency improvement claimed.

# Verification

Full frontend scope selected by make verify-plan. Root make verify completed delegated check, 172 unit tests, 214 UI cases, 10 production-route cases, 11 discovery cases and 3 Style Studio cases. The initial branding assertion expected an absolute favicon attribute; it now checks the resolved URL for relative build output. HTML assertions ensure the base precedes module scripts. Final same-image Docker/Nginx verification passed at /qa/nested and /another-app, including identical entry bundles, navigation/reload, SSE and independent sessions. English/Korean docs updated. No required checks omitted; unchanged delegated checks are reused via content-bound receipts. No native desktop build: native code/config is unchanged; root production routing and API recovery tests cover the shared frontend.

# Page Family

Nonvisual URL resolution within the existing main page.

## Family

Existing main page family; no new layout or controls.

## Reference

src/pages/main/ProjectOverview.tsx and existing publicPath consumers.

## Shared Rules

Existing markup, spacing, typography and responsive styles remain unchanged.

## Exceptions

No visual exceptions.

## Evidence

Only asset URLs change. Production browser tests validate loading; existing layout tests cover the unchanged presentation.

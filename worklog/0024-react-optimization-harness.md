# Commit Title

perf(react): enforce state and memoization review

# Changed File Scope

Admin table component/page, render regression tests, performance checker/fixtures, worklog governance/template, Make/CI, AGENTS and EN/KO state/performance documentation.

# Reason

Make state ownership and React.memo optimization the default review workflow; prevent regression of shared config and lazy route gains. Evaluate Zustand/Redux against actual state needs.

# Design

Extract a memoized admin table with stable API items and locale-scoped date formatter. Keep filters/page API ownership in AdminPage. Add static guards for protected optimization boundaries, runtime render/production-route checks, and mandatory State Ownership/Memoization/Performance Evidence worklog sections for future runtime changes. Use the committed template as policy activation so historical commits remain valid. Do not add an external state library without a demonstrated shared-state need.

# Verification Plan

Child make check test build test-ui test-routes; root check/test/build and frontend-format-check/frontend-test. Harness rejection/acceptance fixtures and render work counts, plus PR CI.

# Impact

No API or persisted-state changes. Future runtime changes require an explicit state/memo decision and evidence; exceptions require reasons. CI runs production route recovery coverage.

# Loop Alignment

API state remains in page-owned hooks; no new realtime or desktop recovery owner. UI composition uses existing controls/classes with no shared UI catalog exports. Governance validates evidence, not performance correctness.

# State Ownership

Admin query/typing stays local, API snapshot belongs to useAdminUsers. Config/auth/connectivity remain scoped providers. Zustand deferred pending cross-screen high-frequency client state; Redux Toolkit deferred pending complex event/state workflows. No duplicated server cache or persisted credentials.

# Memoization

AdminUserTable is the default React.memo boundary: unchanged rows/loading/error props skip parent typing updates. Date formatter uses useMemo per language. No callback props/custom deep comparator. Context language changes must still rerender. Trivial controls and context owners are not blanket-memoized.

# Performance Evidence

Observed: ten rows format 20 dates initially using one formatter. Six draft-search keystrokes add zero formatting calls and no formatter construction. Changed rows, language, loading and error render correctly. Config sharing and production lazy-route regression tests pass. Entry JS remains 390.76 kB (gzip 121.26). These are work counts, not latency measurements.

# Verification

Passed child make check test build (79 tests), make test-ui (54 browser cases), root make frontend-test-routes (3 production browser cases), and final root make check test build (82 backend / 79 frontend tests, including frontend-format-check/frontend-test). Performance checker: 6 acceptance/rejection fixtures; governance: 10 tests including staged-vs-worktree and committed snapshot behavior. Existing UI harness: 7 fixtures. Fixed a TypeScript accessor-spy signature and wrapped language cleanup in act; final run has no new act warnings. No required checks skipped. Staged governance and required PR CI are checked before merge.

# Commit Title

perf(routes): load secondary pages on demand

# Changed File Scope

App route imports, route suspense/error boundary, localized messages, production route tests, Makefile and EN/KO guides.

# Reason

The startup bundle includes settings, admin and authentication screens even when the user only opens the showcase.

# Design

Module-level React.lazy for secondary pages; keep showcase and shared shell eager. Local Suspense preserves the sidebar and auth background. Route errors offer explicit reload or home navigation; no automatic reload loop. Keep auth guards intact. This task is separate from config sharing and state/memo harness changes.

# Verification Plan

Root frontend-format-check/frontend-test; child check/test/build/test-ui and production browser route loading/error tests. Compare built initial JavaScript with the 426.68 kB baseline. Staged governance and required CI.

# Impact

First secondary navigation loads a small extra chunk; deployed assets must retain compatible chunk files. CSS remains shared.

# Loop Alignment

API state and desktop recovery unchanged; no new realtime work. UI composition reuses PageStateFrame/Button; no new shared UI export or stylesheet.

# Verification

Passed make check test build (77 tests), make test-ui (54 browser tests), make test-routes (3 production browser cases), and root frontend-format-check/frontend-test. Production entry JS decreased from 426.68 kB (gzip 130.36) to 390.76 kB (gzip 121.26); 11 secondary pages split. Delayed chunks preserve sidebar, failed chunks support explicit reload and home recovery. Test URL assertion adjusted to account for existing settings section normalization. No required checks skipped.

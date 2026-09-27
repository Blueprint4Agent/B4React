# Commit Title

feat(admin): add administrator user panel

# Changed File Scope

Admin page, profile/sidebar navigation, auth API hook, contract adoption, styles, locales and tests

# Reason

Administrators need a dedicated user monitoring panel accessible from their profile menu.

# Design

Reuse settings shell and shared controls. Admin-only route and profile entry, paginated searchable users and overview, manual reload plus focus/desktop recovery refetch. No role editing controls.

# Verification Plan

Backend Make checks/tests and contract export; child check/test/build/test-ui; final parent check/test/build and governance.

# Impact

Read-only administrator access; ordinary users cannot read the directory. Existing login/role management stays intact.

# Loop Alignment

Backend route -> admin dependency -> auth service -> repository. Read-only feature needs no new events or background tasks. Frontend uses typed auth API/hook, focus refresh and desktop recovery; shared sidebar and UI composition. No online-presence claim or durable login audit in initial scope.

# Verification

Passed child `make check test build` (73 tests), `make test-ui` (50 browser cases) and parent `make check test build`. Reviewed 390px/1440px screenshots; adjusted summary wrapping and bounded table height so pagination remains accessible. Initial hook tests used MSW after openapi-fetch captured fetch at import time; aligned with existing API-client spies and verified real HTTP in Playwright. API state/recovery/composition loops followed; no mutation/event/task loop needed. No required checks skipped.

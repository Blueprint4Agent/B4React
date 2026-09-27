# Commit Title

perf(config): share application configuration requests

# Changed File Scope

AppConfigProvider, useAppConfig, auth bootstrap/recovery, app bootstrap, tests and EN/KO guides

# Reason

Share /config between app, authentication, sidebar and pages; initial production navigation currently makes 3–4 identical requests.

# Design

Provider-scoped state and in-flight promise deduplication. Stable ensureConfig reads the current snapshot; reload explicitly refetches. One desktop recovery coordinator reloads configuration before session revalidation. Keep failed configuration distinct from disabled login and retry through the same owner. No code-splitting or memo changes in this task.

# Verification Plan

Root frontend-format-check/frontend-test; child check/test/build/test-ui; parent integration check/test/build; production request-count measurement and staged governance.

# Impact

No public API or configuration schema changes; no persistent caching of bootstrap tokens. Providers are scoped to the mounted application.

# Loop Alignment

API state centralized; desktop recovery refreshes config then session. Realtime and UI composition unchanged. No backend or mutation loops apply.

# Verification

Passed child make check test build (77 tests) and make test-ui (54 browser tests); root make frontend-format-check frontend-test and make check test build. Browser assertions verify exactly one initial /config request on showcase, settings and admin, and one retry after failure. StrictMode/provider-isolation and recovery-order regression tests pass. No required checks skipped.

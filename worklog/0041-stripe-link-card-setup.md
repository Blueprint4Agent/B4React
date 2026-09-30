# Commit Title

feat(billing): add Stripe setup API contract and adapters

# Changed File Scope

Pinned OpenAPI/source metadata, generated types, billing API/error/hook modules,
API integration tests and English/Korean contract notes.

# Reason

Prepare typed consumers for the provider's charge-free card and Link registration.

# Design

Adopt the additive provider contract and supply the required API/error/hook boundary.
All requests reuse bearer auth through the shared HTTP client. Setup takes a caller-owned
request UUID so a retry retains its identity. No new page, Stripe browser SDK or card input.

# Verification Plan

Generate local types and run make verify-plan then make verify. Test bearer requests,
setup UUID preservation, list cursors, status retrieval and typed failure extraction.
Validate staged governance and ready PR metadata before merging with a merge commit.

# Impact

Additive contract and unused adapters; existing settings appearance/behavior is unchanged.
No frontend key or card details are stored. A future page must own completion/refetch state.

# Loop Alignment

API loop boundary prepared through billingApi/billingError/useBillingApi. No new page state,
realtime subscriber, desktop request loop or UI composition; those loops are not applicable
until a consuming billing page exists. Never infer success from the return URL alone.

# State Ownership

Stripe owns registration/payment methods. Hook exposes stable functions with no automatic
requests, cache or persistent state. Future page owns loading/errors and account reset.
No Zustand or Redux is needed.

# Memoization

useMemo retains the adapter object identity, matching existing domain hooks. React.memo
is not applicable because this change adds no rendered component or expensive boundary.

# Performance Evidence

No render or latency improvement claimed. Tests will verify hook render issues zero
requests and keeps identity stable. Full checks cover existing render and route behavior.

# Verification

make verify-plan selected full frontend verification (protected API/contract changes).
make verify passed: hooks-test; check/test (102 tests across 30 files); test-ui
(71 browser tests); test-routes (6 production tests); test-style-studio (3 tests).
API tests show stable hook identity, zero render-time requests, bearer headers,
retry UUID preservation, cursor propagation and typed error handling. No selected
checks omitted. Live Stripe registration was not run: no sandbox key is configured,
and mocked contract tests cannot establish provider account readiness.

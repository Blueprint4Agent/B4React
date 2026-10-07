# Commit Title

fix(billing): share subscription state and coordinate authentication

# Changed File Scope

Shared HTTP/session recovery, AuthProvider, subscription hook and regression tests; localized state documentation.

# Reason

Concurrent protected requests must share one credential recovery. Focus and routine token renewal must not repeatedly fetch subscription snapshots.

# Design

Scope expanded: a provider-owned in-memory subscription snapshot is shared across page/sidebar mounts; no focus/timer polling. Explicit reload and known lifecycle transitions invalidate or replace the snapshot. Mocked browser suites are isolated from developer backends.

Common HTTP transport retries INVALID_TOKEN once using AuthProvider recovery; exclude auth lifecycle endpoints to avoid recursive refresh. Preserve request bodies and session boundaries. Subscription reads remain event-driven, with no focus polling; token notifications recover only failed reads.

# Verification Plan

Request-count regressions for concurrent and late 401s, failed renewal, session switching and request replay. Subscription focus/token/mutation/reconnect regressions. Run make verify-plan then make verify.

# Impact

No backend or contract change. Explicit reload, subscription mutations and checkout returns remain available. Normal online/focus events do not invalidate subscription state.

# Loop Alignment

API wrappers keep transport ownership; AuthProvider owns identity. Desktop recovery and subscription change events remain. No new realtime channel or timer is introduced.

# State Ownership

A transport-scoped recovery coordinator owns in-flight work only; AuthProvider owns credentials and identity, hooks own snapshots. Account-scoped SubscriptionSnapshotProvider retains server snapshots in memory; no browser persistence or new state library.

# Memoization

No visual component changes or expensive render boundary. Stable provider callbacks and hook callbacks retained.

# Performance Evidence

Regression evidence: concurrent/late invalid-token requests share one recovery; StrictMode restores identity once; healthy token/focus changes add zero subscription reads; later page mounts reuse one shared snapshot, and account switch starts one new read. No latency claim.

# Verification

Root make verify-plan selected backend=True/frontend=full. Full root verification passed: 140 frontend unit/integration tests, 164 UI browser tests, 9 production-route tests, 3 style-studio tests, contracts and packaging. Child targets were delegated through the root; no duplicate manual run is needed for unchanged content. Pre-push validates the authored branch. No selected category skipped; native installers and live payment/email are outside scope.

# Page Family

## Family

Nonvisual transport/hook work.

## Reference

Existing billing and settings consumers remain unchanged.

## Shared Rules

No shell, styles, typography or actions changed.

## Exceptions

None; request lifecycle only.

## Evidence

All 164 browser journeys passed with unchanged page layout. Actual developer browser showed one /auth/me and one subscription response, both 200; five focus events added no subscription request. Additional recurring logs traced to unmocked E2E requests following local .env; browser fixtures now block unmocked cross-origin calls and assert isolated API origin.

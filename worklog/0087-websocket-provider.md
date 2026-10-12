# Commit Title

feat(realtime): add opt-in websocket provider template

# Changed File Scope

Optional frontend WebSocket transport provider, lifecycle tests and localized integration documentation; parent owns pinned child integration.

# Reason

Prepare a reusable socket lifecycle without opening a connection or adding a server protocol before a feature needs one.

# Design

Caller provides enabled flag, session key and stable abortable connection factory. Provider owns socket/timers/status, bounds retries, rejects unavailable sends, cancels stale async work and cleans up on owner change, offline, disable and unmount. Incoming messages remain callback-owned; no persisted credentials or message queue. Existing inbox/support SSE remains unchanged.

# Verification Plan

Root make verify-plan/verify and focused lifecycle tests: default disabled, readiness, ownership cleanup, late factory discard, capped retries/manual retry and policy close. Confirm no App mount, environment change or backend route is introduced.

# Impact

Opt-in template only. No network connection unless explicitly mounted and enabled. No database change, image build or external service configuration.

# Loop Alignment

Reuses desktop connectivity and browser online recovery. Session identity scopes socket lifetime. Future domains own message validation and HTTP reconciliation. API/domain-event/background-task loops are not changed because no server endpoint or message domain is added.

# Verification

Focused lifecycle tests passed all three cases. Root classifier selected full frontend validation and omitted backend tests because backend/API contracts are unchanged. Final full results recorded below. No image build or real WebSocket endpoint connection.

# State Ownership

Provider owns socket refs, retry timer and low-frequency connection status. Callers own authentication descriptors, session key and raw message handling; no Redux/Zustand or message state.

# Memoization

Memoize context value and stable reconnect/send callbacks. There is no rendered expensive UI boundary and no message-driven React rerender; React.memo is not applicable.

# Performance Evidence

Tests observe zero factory calls while disabled, one socket per enabled session, exactly six failed connection attempts before stopping, explicit retry restarting the loop, and zero sockets from a late disabled factory. Policy closure never reconnects. No latency claim.

# Page Family

## Family

No visual page changes.

## Reference

Existing realtime subscription and desktop connectivity hooks.

## Shared Rules

Provider adds no controls, surfaces or layout; existing settings/admin families remain unchanged.

## Exceptions

Opt-in WebSocket transport is independent from SSE and is deliberately not mounted in App.

## Evidence

Lifecycle tests and root-selected existing UI/route checks; no new visual comparison needed for a nonvisual provider.

Final root make verify-plan/verify passed: frontend check, 168 unit/component tests, 209 UI browser cases, production routes, style-studio, pinned contract/package and project-build checks. Backend tests omitted as unchanged; last support scope passed 469. Local database confirmed at 0019 head. No image or backend WebSocket endpoint publication.

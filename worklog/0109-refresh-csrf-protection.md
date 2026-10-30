# Commit Title

feat(auth): send session csrf tokens during refresh

# Changed File Scope

Pinned provider contract/provenance and generated types, auth API/error adapters, CSRF transport regressions and browser/MSW fixtures; English/Korean documentation.

# Reason

Cookie refresh currently accepts cross-site requests without a CSRF proof.

# Design

Synchronizer token stored in Redis per refresh session. A no-store bootstrap GET requires a custom header and valid refresh cookies; frontend retrieves the token before refreshing. Explicit body credentials remain supported without cookie fallback. No relational schema changes.

# Verification Plan

Focused security regressions, then VERIFY_BASE branch-wide make verify-plan and make verify; staged governance and actual PR metadata checks.

# Impact

Cookie clients must adopt the header; existing sessions bootstrap lazily. Redis expiry/logout removes CSRF state. Coordinate child-first frontend integration.

# Loop Alignment

Backend request/service/Redis/error and frontend API/recovery loops apply. No domain events/background jobs/UI composition changes; realtime and desktop reuse existing recovery.

# State Ownership

CSRF proof stays request-local in the auth API wrapper; AuthProvider retains session ownership. No persisted token store or new library.

# Memoization

No React rendering boundaries change; memoization is inapplicable.

# Performance Evidence

Two CSRF transport tests passed: bootstrap/refresh ordering, current-session header forwarding across account switches, and bootstrap failure stopping refresh. One extra request per refresh; no latency improvement claimed.

# Verification

Standalone branch-wide `VERIFY_BASE=085b4ec07a2bf35e074750001434f93ad48745c0 make verify-plan` selected full frontend-app/contracts; `make verify` passed check-app, 214 tests, 253 browser cases and 18 production-route cases after updating immutable provider provenance. Two focused CSRF regressions passed. No visual changes or deployment; browser harness uses mocked APIs. Editor/discovery tooling was not selected because no corresponding source changed.

# Page Family

Not applicable: auth transport changes do not alter UI composition or appearance.

## Family

Not applicable: auth transport changes do not alter UI composition or appearance.

## Reference

Not applicable: auth transport changes do not alter UI composition or appearance.

## Shared Rules

Not applicable: auth transport changes do not alter UI composition or appearance.

## Exceptions

Not applicable: auth transport changes do not alter UI composition or appearance.

## Evidence

Not applicable: auth transport changes do not alter UI composition or appearance.

# Commit Title

feat(admin): add opt-in public administrator demo

# Changed File Scope

Shared administrator pages/hooks, demo routes and navigation, pinned API contract, browser Make target, English/Korean guides and regression tests.

# Reason

Let visitors explore administrator screens using real server health and anonymized user records.

# Design

Use optional /config.demo_enabled to gate production/development routes and navigation. AdminPage and AdminServerPage reuse the same collection/status views with a demo data-source argument. Hooks key snapshots by source and owner, abort stale requests and retain desktop recovery. Existing administrator role guards remain unchanged. The pinned additive contract describes companion public endpoints; anonymization and enablement enforcement belong to the backend.

# Verification Plan

Root make verify-plan and make verify against branch base; privacy, access control, config and browser navigation checks. Child PR merges before parent gitlink update.

# Impact

Explicit opt-in publishes counts, roles, activity flags, day-level dates and server health. Disabled mode returns 404. Snapshots may lag thirty seconds.

# Loop Alignment

Request/service/repository and central errors are retained. Read-only queries need no domain event or background task. Frontend retains API state, cancellation and connectivity recovery; no mutation realtime event.

# Verification

Root make verify-plan selected full child verification; delegated Make targets passed: check (architecture, contracts, formatting, TypeScript), 165 unit/component/integration tests, 196 browser tests, 10 production route tests and 3 style-studio browser tests. Dedicated demo cases cover anonymous production access, alias search, refresh, disabled navigation/direct routes and no private endpoint requests. Existing admin role and memoization tests pass. Root integration contract/package checks passed. No selected child checks omitted; backend validation is owned by the parent.

# State Ownership

Backend config owns enablement. Local collection state owns filters; hooks own snapshots keyed by source and user. No new store.

# Memoization

Retain memoized AdminUserTable and stable query. No blanket memoization.

# Performance Evidence

Demo browser tests observe zero private API requests during guest navigation. Existing memoized table tests still assert no additional date formatting during unrelated search input. Production lazy-route checks pass; no latency improvement claimed.

# Page Family

## Family

Settings and administrator collection.

## Reference

src/pages/admin/AdminPage.tsx and AdminServerPage.tsx.

## Shared Rules

Reuse exact components, cards, typography, filters, table, refresh controls and responsive styles.

## Exceptions

Localized demo disclosure replaces description; navigation uses public demo URLs.

## Evidence

Five demo browser cases passed. Compared actual administrator and demo card width/padding/heading size at 390px and 1440px in light/dark; all match and mobile has no document overflow. Inspected demo-users.png and demo-server.png under test-results/admin-demo-public-demo-\*; backend address redaction has an explicit Hidden in demo label. No new visual family or style overrides.

# Commit Title

feat(inbox): add persistent notification inbox

# Changed File Scope

Inbox data model/migration, authenticated API, SSE event, shared frontend inbox state/page and profile entry, localized docs and tests.

# Reason

Provide durable user-visible notifications independently of lifecycle email delivery, ready for the separate inquiry feature.

# Design

Scope update: center empty/loading states; add transactional welcome notifications for email/OAuth signup and deduplicated confirmed subscription-start/plan-change notifications independently of email delivery. Browser verification covers centered states and localized content.

User-owned inbox records persist in SQL. Reads and read-state writes always scope by current authenticated user, including admins. No public create endpoint. Internal producers can add notifications in their domain transaction. SSE carries invalidation only after commit; reconnect/focus reload authoritative DB state. Read-all uses a high-water ID so newly arriving notifications remain unread. No email or background job required.

# Verification Plan

Run root make verify-plan and make verify. Verify user isolation, read idempotency/high-water behavior, persistence and offline/reconnect UI recovery; browser checks reuse settings family.

# Impact

Additive migration and API. Public demo has no access to inbox data. No container image build/publication.

# Loop Alignment

Router/service/repository with auth guards and central typed errors. Post-commit domain event refreshes page/header state. Background tasks are not applicable to immediate durable inbox writes. Existing desktop recovery and UI composition are retained.

# Verification

Root Make classifier selected full frontend validation because App/layout/shared styles/contracts changed. Backend integration passed 468 tests. Frontend check and 165 tests passed; final browser/production checks are recorded below after completion. No Docker/desktop publication requested.

# State Ownership

Shared provider owns unread count and invalidation revision per account. Page owns list/filter/page state; abort stale requests on owner changes. No external store.

# Memoization

Notification rows use React.memo with stable callbacks; context count changes do not require custom comparisons.

# Performance Evidence

Five inbox browser cases pass: account-scoped list/count, failed write retention, read persistence, high-water bulk reads, and SSE invalidation. Four viewport/theme cases retain General card geometry. Memoized rows receive stable markRead callbacks. No latency improvement is claimed.

# Page Family

## Family

Settings collection.

## Reference

AdminPage and settings content cards.

## Shared Rules

Reuse settings shell, header, rows, buttons, pagination and inline feedback.

## Exceptions

Notification content is a list rather than a directory table; retain shared surfaces.

## Evidence

Compared card width, padding and heading font against Settings General at 390/1440 in light/dark. Browser geometry confirms the empty message is centered on both axes. Inspected the 390px light inbox-empty.png artifact; checkbox and wrapped toolbar retain shell alignment. Loading uses the same centered wrapper.

Final root make verify-plan/verify passed: backend 468, frontend 165 unit/component and 201 UI browser cases, production route/style-studio checks, contract/package checks and project-build test. Full scope was selected; container image and desktop publication omitted as not requested.

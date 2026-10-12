# Commit Title

feat(support): add private support inquiries

# Changed File Scope

Support inquiry models/migration/API, settings/admin screens, inbox integration, contracts and localized docs/tests.

# Reason

Let users contact administrators in settings and follow private conversations; administrators review all inquiries.

# Design

SQL inquiry/message history with author/admin authorization, open/in_progress/closed statuses and bounded text/thread sizes. Request UUIDs prevent duplicate create/reply retries. Lock owner/thread for mutation serialization. Persist inbox notifications in the same transaction, publish content-free SSE after commit. No public demo access, email dependency or attachments.

# Verification Plan

Root make verify-plan/verify. Integration covers author isolation, manager/admin boundaries, retries, reply/status notifications, closed-thread rejection and validation. Browser checks settings/admin flows with mobile/desktop light/dark peer comparisons.

# Impact

Additive migration 0019. Settings support menu and private admin management. No image builds.

# Loop Alignment

Router/service/repository/error loop; transactional inbox then existing SSE invalidation. Hooks cancel stale requests and reload after reconnect/focus via InboxProvider. Desktop availability gates writes. Synchronous support writes need no background worker.

# Verification

Backend architecture, environment, lint, contract and 469 tests passed. Dedicated support browser suite passed all eight user/admin × mobile/desktop × light/dark cases. Full root validation selected backend plus full frontend due shared routing/styles/contracts; final totals recorded below. No container/desktop publication requested.

# State Ownership

Server owns threads/status. URL owns selected inquiry; page owns filter/page; composer owns drafts; hook owns cancelable snapshots/mutations and stable request IDs for retries. No external store.

# Memoization

Memoize message history receiving stable arrays; keep high-frequency draft changes in Compose/Reply children. Simple list rows do not require separate memo boundaries.

# Performance Evidence

Eight browser scenarios verify request success/failure, draft retention, persisted reply reload and admin close behavior. Compose/Reply keep keystroke state local; memoized message history receives unchanged arrays while typing. No latency improvement is claimed.

# Page Family

## Family

Settings and admin collections.

## Reference

SettingsPage General, AdminPage and InboxPage.

## Shared Rules

Shared card/header, controls, rows, pagination and centered status area; no nested settings header wrapper.

## Exceptions

Conversation content uses plain-text messages with bounded thread history instead of directory columns.

## Evidence

Eight browser cases compare card width, padding and heading size against Settings General at 390/1440 in light/dark. Inspected support-admin-390-light/support.png: shared shell, wrapped actions, bounded text, message surfaces and closed state remain aligned. Full-width overflow checks pass.

Final root make verify-plan/verify passed: backend 469, frontend 165 unit/component tests and 209 browser UI cases, production routes, style studio, contract/package and project-build checks. Full safe scope selected; no image publication.

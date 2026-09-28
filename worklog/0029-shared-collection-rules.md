# Commit Title

refactor(collections): share search and pagination rules

# Changed File Scope

src/hooks/collections, src/utils/collections.ts, AdminPage, ShowCasePage, DeveloperApiKeysSection, hook regression tests, English/Korean usage/engineering guides.

# Reason

Share list query validation, search submission and page calculations without changing existing API contracts.

# Design

Retain domain-owned filtering, ordering and request hooks. Reuse the existing Pagination and InputField controls. Consume the unchanged pinned API schema; extract frontend collection query state and local pagination. Keep API key fetching unchanged; server pagination requires a separate contract change.

# Verification Plan

make check, make test, make build and make test-ui; validate staged Git governance. Provider integration runs in the consuming repository.

# Impact

No migration or new dependency. Keep existing page sizes and immediate showcase versus submitted admin search. Provide reusable examples in English and Korean.

# Loop Alignment

Request/router/service/repository and frontend page/domain-hook/API loops retained. Existing realtime refresh and desktop recovery remain domain owned. UI composition reuses existing controls. No new domain events or background tasks: this is read-only collection infrastructure.

# State Ownership

Draft search, applied search, filters and page remain local to the consumer hook. Server snapshots remain in domain hooks; no persistence, URL migration or global store.

# Memoization

Preserve AdminUserTable memo and original API items reference. Memoize local slices; pure calculation helpers and small hooks need no new React.memo wrapper.

# Performance Evidence

Admin typing regression passes: six draft characters produce zero additional date formatting across ten two-date rows. Collection tests verify submitted/immediate search, page/filter/size transitions, shrinking/empty collections and explicit reset keys. Stable API query dependencies and original row references retained; no latency improvement claim.

# Verification

make check and make build passed. 85 Vitest tests and 54 Playwright UI tests passed, including mobile/desktop admin search, catalogue search and API-key pagination. Final make check/test/build and all 54 UI cases passed again after stabilizing the shared setPage callback. No required checks skipped.

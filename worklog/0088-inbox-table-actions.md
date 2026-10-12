# Commit Title

feat(ui): refine inbox actions and inline profile editing

# Changed File Scope

Inbox table/selection/details/delete UI, profile count badge/order, shared checkbox variants, owner-scoped bulk APIs and deletion migration, contracts/tests/docs, and outside-click cancellation for profile inline edits.

# Reason

Replace the inline count and card list with a consistent collection UI, readable notification details and safe user-controlled deletion.

# Design

Place inbox directly after profile and display a compact trailing badge. Reuse admin table, shared buttons/checkbox and modal. Selection applies to the visible page; opening details marks read and only offers Close, per the final user request. Compact rows/buttons keep icon-label alignment. Filter changes retain the same-owner table while disabling stale actions until the new response. Bulk read/delete are owner-scoped and bounded. Deletion erases content and retains a tombstone/delivery key to suppress duplicate billing webhook replays. Post-commit SSE refreshes authoritative counts/lists.

# Verification Plan

Root make verify-plan/verify. Verify selection, partial selection, keyboard checkbox, detail/read behavior, confirm/cancel deletion, owner boundaries, tombstone deduplication and mobile/desktop light/dark geometry.

# Impact

Additive migration 0020 and API. Selected deletion is confirmed and cannot affect another user's records. No image build.

# Loop Alignment

Keep API hook state and account isolation; repository transaction precedes SSE invalidation. Existing desktop recovery remains. Profile cancellation discards only the local draft and does not submit an API request. Floating location menus remain part of the edit boundary; busy saves cannot be cancelled by outside clicks. No background task needed. Reuse collection/modal controls.

# Verification

Root make verify-plan and make verify selected backend plus full frontend verification (shared controls/styles). Backend 470 tests, frontend 168 tests, 210 browser checks, production route/style/contract/package/build checks passed. After the final outside-click change, focused inbox/profile browser coverage passed 26 tests, including save/country-region portal interactions and zero-write cancellation. Final pre-push hooks revalidate the complete branch range. Migration 0020 applied to local PostgreSQL. No Docker/GHCR build or remote deployment: explicitly excluded by the user. No unrelated extra validation.

# State Ownership

Server owns inbox/read/deleted state; page owns current-page selection and dialog snapshot. Existing hook owns abortable reads/mutations, provider owns count/revision. No external store.

# Memoization

Memoized table rows receive stable callbacks and boolean selection; only changed rows need updates. Dialog/toolbar are small and driven by local state.

# Performance Evidence

Delayed-response browser coverage confirms filter changes retain the table and disable stale row actions; SSE invalidation refreshes durable state. Row selection is local with stable callbacks and memoized rows. Profile outside cancellation only clears editor state; no extra memo boundary is justified for this small form. No latency claim.

# Page Family

## Family

Settings shell, admin collections, shared modal and existing profile inline editor.

## Reference

AdminUserTable/AdminPage, Settings General header geometry, ProfileDropdown settings shortcuts, shared Modal and existing ProfileInlineForm.

## Shared Rules

Reuse admin table shell/header, spacing, row surfaces, buttons and bounded horizontal overflow. Count aligns to the trailing shortcut column.

## Exceptions

Notification rows show a one-line preview with complete content in the shared modal; 60px rows and 30px buttons meet the requested compact density while retaining the collection family. Profile form geometry is unchanged.

## Evidence

Compared Settings General shell/header width, padding and font with Inbox at 390px and 1440px in light/dark browser tests. Screenshots: test-results/inbox-inbox-reads-persist-and-match-settings-1440-dark/inbox.png and corresponding inbox-badge.png/mobile variants. Existing admin-table borders, scrolling, checkbox and shared modal controls remain; inspected desktop table and mobile badge. Button icon/text center geometry and originating sidebar links are asserted.

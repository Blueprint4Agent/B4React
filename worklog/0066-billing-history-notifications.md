# Commit Title

feat(frontend): improve billing and settings interactions

# Changed File Scope

Additional frontend scope: keyboard shortcuts and local persistence, compact shared controls/showcase, settings entry animations, home/admin headers, profile role placement and subscription glyph geometry.

Billing invoice paging/detail and lifecycle recovery, notification outbox/webhooks/mail, account deletion, frontend history/retry UI, settings animation, contracts/tests/docs.

# Reason

Keep billing history inside the app, isolate section failures, recover partial subscription changes, and send only subscription-start/plan-change/account-deleted emails. Replay settings entry animation per sidebar section.

# Design

Follow-up UI scope includes compact shared buttons, title icon removal, customizable keyboard settings, and the sidebar subscription badge. Keep the badge inside the existing profile avatar wrapper; use a fixed 16px circle with no inherited padding or letter spacing and a one-line centered glyph. Compare existing profile rendering in both sidebar widths and themes.

Use owned invoice APIs and shared Modal/Tooltip. Independent billing section snapshots/retries. Signed Stripe events plus encrypted durable outbox and existing Celery/SMTP path; deletion notification saved in deletion transaction. Subscription schedule retry verifies the original snapshot and matching provider idempotent creation response before recovery. No failure or renewal emails.

# Verification Plan

Run root verify-plan/verify; regression tests for ownership/cursors, partial failures/idempotency, signed/deduplicated events, deletion atomicity, worker retries and UI dialog/retry/animation behavior.

# Impact

New additive outbox migration and optional webhook secret; webhook configuration and Celery Beat required for durable notification delivery. No real charges or external emails in tests.

# Loop Alignment

Request/service/repository/error loop; durable mail event outbox consumed by bounded background workers. Frontend account-owner/recovery guards remain. No realtime entitlement projection added.

# State Ownership

Billing hooks own account-scoped server snapshots with generation guards and independent section errors; history owns only its open dialog and pagination. Shortcut context owns two low-frequency browser preferences persisted in localStorage; capture focus is page-local. No new state library. Disabled billing/offline transitions invalidate history and section requests.

# Memoization

No new memo boundaries: invoice rows are small paginated lists and their click state changes on navigation. Keyboard has two trivial rows. Stable provider value changes only with bindings; API ownership remains in page hooks. Existing protected admin memo boundary is retained.

# Performance Evidence

131 component/unit/integration tests passed after authentication recovery. Browser shortcut customization, reload, collision and reset tests passed; profile badges measure 16x16px for all five plan variants. Final full verification results recorded below. No latency improvement claim.

# Verification

Root full verification passed: 274 backend, 131 frontend, 161 UI, 9 production-route and 3 style-studio tests. Two additional browser cases then passed for logged-in refresh success/failure, bringing browser coverage to 163 cases. Child make verify-plan / make verify also passed the final full scope: 131 unit/component tests, 163 browser UI tests, 9 production-route tests and 3 style-studio tests, plus hooks, architecture, generated contract, format and type checks. Planned staged commit and PR metadata governance passed. Selected full scope because shared UI, route/runtime and generated contracts changed. Earlier focused checks cover invoice modal at 390/1440px, isolated retries in both themes, all subscription badge tiers and browser shortcut persistence. No live Stripe charge or SMTP message sent.

# Page Family

## Family

Settings, shared controls, sidebar profile, collection/admin and invoice modal.

## Reference

SettingsPage General and Appearance are keyboard/profile peers; existing Modal owns invoice shell/focus; AppSidebar and ProfileDropdown own shortcut labels; ShowCasePage demonstrates shared controls.

## Shared Rules

Reuse settings header/row width and spacing, shared Button/KeyboardShortcut/InputField/ToastCard and Modal/Tooltip. Default and capsule buttons align with dropdown height. Keyboard cards capture directly, blur cancels, duplicate combinations use toast. Role badges live in the profile photo card.

## Exceptions

Native history has invoice-specific line items and pagination inside the shared modal. Shortcut preferences belong to this browser, not an account API. Browser/OS may intercept their own shortcuts; the application imposes no modifier or reserved-key restriction.

## Evidence

Existing peer checks and targeted billing cases passed at 390/1440px in light/dark. Billing invoice modal and compact badge geometry were browser-checked; final shared-control and profile comparisons recorded after final verification.

## Authentication follow-up

Invalid-token recovery is owned by AuthProvider: force reload cached bootstrap config or refresh the login session, deduplicate concurrent recovery, and ignore stale login/logout epochs. Subscription reads serialize per owner generation, retry once after a changed token, and suppress focus/online polling with a rejected token. A new token allows reads again. Browser expired-bootstrap recovery and repeated-focus rejection fixtures passed. DebugMCP could not start a browser session; its breakpoint was cleared and no debug session remained. No temporary production logging was added.

## Additional peer evidence

Admin search and dropdown heights both measured 32px (floating geometry tolerance 0.01px); profile save is 32px and admin/manager badges are inside the photo card. Compact action menus grow right from the trigger with viewport clamping, with red destructive text in both themes. Keyboard conflict notices use ToastCard; clicking away cancels capture, and menu order places Keyboard directly after Account.

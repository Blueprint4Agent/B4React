# Commit Title

feat(auth): open guest showcase with compact authentication dialogs

# Changed File Scope

App routing, profile menu, shared Modal, login/signup page composition, locales,
styles, auth browser tests and bilingual guides.

# Reason

Let visitors browse the showcase before signing in and open compact authentication
from the profile menu without unsupported billing/help/Apple/phone actions.

# Design

Expose showcase routes inside the shared app shell; keep settings authenticated
when login is enabled and preserve fail-closed configuration handling. Route-based
login/signup dialogs overlay the showcase and reuse existing page-owned API hooks.
Use configured Google/GitHub providers above an email-first login form, retaining
password, remember options, resend verification and recovery links. Add a guest
profile call-to-action. Extend shared Modal keyboard dismissal/focus containment.

# Verification Plan

Run child check/test/build/test-ui and parent frontend-format-check/frontend-test.
Exercise anonymous showcase, guest menu, modal open/close/Escape/tab containment,
email-to-password, configured providers and protected settings at desktop/mobile.
Keep existing login error, account and API-key flows covered.
Backdrop follow-up: remove the dark tint and duplicated blur; use one transparent
6px blur layer so underlying page colors remain unchanged.
Profile-trigger follow-up: add 5px collapsed padding in a 40px control and
7px/10px expanded padding in a 44px row, retaining coarse-pointer minimums.

# Impact

Public showcase browsing replaces forced login on entry; account/API-key settings
remain protected. No backend contract or auth/session storage changes.

# Loop Alignment

UI composition reuses Modal and existing auth pages. API state stays in page-owned
auth hooks. Realtime and desktop recovery are unchanged; no new transport loops.

# Verification

Child make check/test/build passed; all 55 Vitest tests and 30 browser cases passed.
Root frontend-format-check/frontend-test passed. Reviewed 390px/1440px light/dark
auth screenshots, transparent backdrop CSS, native focus traversal and protected
settings routing. Existing API-key lifecycle and login error/resend checks pass.
Updated the landing navigation expectation for the intentionally public entry;
kept a distinct backdrop close label to avoid colliding with dialog actions.

# Commit Title

fix(support): clarify requester follow-ups and show sent feedback

# Changed File Scope

InquirySettings, English/Korean locale copy, support browser coverage and documentation.

# Reason

Inquiry submission lacked visible confirmation and requester follow-ups were labeled as administrator replies.

# Design

Use the existing useToast owner after confirmed API success. Show requester Additional message/Send additional message and keep administrator Reply message/Send reply. Preserve the existing private conversation API and idempotent retry flow.

# Verification Plan

Root make verify-plan/verify plus support browser flows covering failed send, successful toast, and role-specific labels.

# Impact

UI feedback and copy only; no API, database or Docker image change.

# Loop Alignment

Keep API submit authority, SSE refresh and desktop availability checks. Toast only follows success; no new realtime/background loop.

# State Ownership

Server remains authoritative, existing hook manages mutation state; global ToastProvider owns transient feedback. No new store.

# Memoization

Existing Messages memo boundary remains. Small submit form labels and success callback need no additional memoization.

# Performance Evidence

No optimization claim. Existing retry and reload browser assertions verify no speculative success feedback.

# Verification

Root make verify-plan/verify selected full frontend plus parent backend integration scope: backend 470, frontend 168, browser 211 tests and production routes/style/contracts passed. Focused support browser coverage: 8 passed, including failed-send no-success-toast and successful retry confirmation with role-specific labels. No backend/schema change in this child PR. No image publication requested; omitted.

# Page Family

## Family

Settings/support collection.

## Reference

Existing InquirySettings and settings PasswordSettings useToast behavior.

## Shared Rules

Reuse existing toast, buttons, fields and shell without layout overrides.

## Exceptions

No layout exceptions; only requester/admin labels differ.

## Evidence

Eight support browser workflows passed for user/admin at 390px and 1440px in light/dark. Header width/padding/font compared with Settings General; no layout styles changed. Screenshots under test-results/support-support-user-1440-light/support.png and corresponding admin/mobile/theme variants.

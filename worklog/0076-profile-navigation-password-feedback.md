# Commit Title

fix(auth): preserve profile navigation and clarify password feedback

# Changed File Scope

Profile navigation state, sidebar, password requirements and email verification feedback, browser tests and guides.

# Reason

Profile retained sidebar width but incorrectly replaced Settings/Admin navigation with main navigation. Password change lacked signup requirements and placed code errors below unrelated password fields.

# Design

Carry a validated sidebar route family in profile navigation history state, preserving it through reload and repeated profile links. Reuse signup ValidationCard through a shared feature component for signup/reset/change. Place code errors beside code input, with accessible association; keep general submission failures at form level.

# Verification Plan

Make verify-plan/verify and browser checks for source navigation, reload, requirement updates and rate-limit feedback placement.

# Impact

No API or persistence changes. Direct profile URLs use main navigation.

# Loop Alignment

URL history owns navigation context; existing AuthProvider and API hooks remain unchanged. No realtime or desktop connectivity change.

# State Ownership

Route state owns sidebar source, modal owns field errors and drafts. No global store.

# Memoization

Five lightweight validation rules update with password input; no expensive stable-prop subtree warrants memo.

# Performance Evidence

Browser checks preserve existing draft-only zero mutations and one save; profile navigation carries only history state. Validation updates local form UI with no API request until explicit code verification or submission.

# Verification

Root `REDIS_IN_MEMORY=true make verify-plan` selected full frontend/backend; `make verify` passed static/policy/type/format, contracts, 435 backend tests, 147 frontend tests, 188 Chromium UI cases, 9 production-route cases, 3 Style Studio cases, integration packaging and build checks. No classifier-selected checks omitted. No native build: there is no native code change. Actual SMTP recovery and user-confirmed receipt are recorded in the parent worklog.

# Page Family

## Family

Account security modal and existing settings/admin sidebar families.

## Reference

SignupPage ValidationCard and AccountDeletionDialog code row.

## Shared Rules

Reuse ValidationCard, AccountEmailVerification and existing sidebar items.

## Exceptions

None: profile remains standalone while preserving the source navigation family.

## Evidence

Browser account-profile cases compared 390/1440px in light/dark, including the shared password/deletion email row geometry. Confirmed source Settings sidebar links survive profile navigation and reload. Screenshot password-modal.png shows the shared conditions; showcase transparency checks cover default and hover states.

## Follow-up verification flow

Add a separate authenticated, attempt-limited code check for password/deletion. Checking does not consume or extend a code; final action atomically validates/consumes it again. Resend cooldown is 30 seconds; latest issuance resets its 600-second TTL and invalidates the old code. UI requires successful verification and resets it on editing/resend/failure.

## Additional scope

Reuse password confirmation ValidationCard, showcase text/transparent icon buttons, and configurable profile shortcut (Cmd/Ctrl+Shift+P). Existing two-action shortcut payloads remain compatible; a nullable optional backend field extends the existing per-account setting. Profile key respects editor/dialog guards and source navigation.

Profile reuses the existing 260ms rise entrance animation and global reduced-motion override. Browser tests verify both durations; geometry assertions wait for entrance completion.

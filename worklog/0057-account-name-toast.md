# Commit Title

fix(ui): simplify account success notifications

# Changed File Scope

SettingsPage.tsx, shared ToastCard CSS, existing toast browser assertions, English/Korean frontend guidance and this worklog.

# Reason

User requested removing the persistent green name-save success card, keeping only the existing popup, and removing the popup border.

# Design

Keep the existing successful updateProfile callback and ToastProvider notification. Remove success feedback state/rendering; keep actionable name/photo errors and mount the name feedback slot only when an error exists. Set the shared ToastCard border to zero for all notifications and the existing showcase.

# Verification Plan

Existing make verify-plan / make verify UI checks; focused browser save verification at mobile/desktop widths in both themes, confirming one success toast and no name feedback card/empty slot.

# Impact

Only successful account-name feedback presentation changes; profile mutation and error recovery stay intact.

# Loop Alignment

Existing auth/profile API state and desktop recovery loops are unchanged. No new realtime path. UI composition reuses ToastProvider and retains shared InlineMessage for errors.

# State Ownership

Profile state stays in AuthProvider; SettingsPage owns editable draft/busy/error state. Remove redundant successful-result state.

# Memoization

No expensive or repeated child boundary changes; memoization is unnecessary for removing conditional markup.

# Performance Evidence

No latency claim. Browser checks observed one profile request for the initial save and one visible success toast; no persistent success state/slot remained.

# Verification

make verify-plan selected UI scope; make verify passed: 122 tests, 112 browser checks and production build. Four focused account-save cases passed. Shared toast checks assert zero border in both themes at mobile/desktop widths; visually reviewed mobile dark showcase screenshot. Production-route and style-studio checks were omitted by the UI classifier because routing/tooling did not change. Backend lifecycle/event/task checks are not applicable to presentation-only changes.

# Page Family

## Family

Settings account profile and shared toast.

## Reference

Existing account name/photo rows, photo-success toast behavior in SettingsPage.tsx and ToastCard showcase.

## Shared Rules

Preserve settings shell, field card, name input/save controls and shared toast.

## Exceptions

Successful name saves no longer reserve a feedback slot; errors still render near the name field. Shared toast drops its border while retaining the existing surface, shadow and radius.

## Evidence

Four live browser cases at 390/1440px in light/dark passed with one success toast, no inline success card or empty feedback slot, no overflow, and retained inline failure/recovery. Artifacts: /tmp/account-name-toast-review/. Visually checked the desktop dark account row against its existing neighboring fields.

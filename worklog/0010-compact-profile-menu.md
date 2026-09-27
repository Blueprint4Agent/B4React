# Commit Title

style(ui): streamline sidebar and profile menu

# Changed File Scope

AppSidebar/ProfileDropdown, global styles, layout browser tests, bilingual guides.

# Reason

Make navigation more compact and use the reference profile popover composition
without adding unavailable features. Keep settings in the profile menu only.

# Design

Use 48px/176px desktop rail/panel widths and 32px sidebar rows. Preserve coarse
pointer 44px controls. Profile popup uses an avatar/name/email header, separator,
settings and existing appearance controls, then separated logout when available.
Reuse UserAvatar/ThemeToggleButton and retain keyboard/outside-click dismissal.

# Verification Plan

Run child check/test/build/test-ui and root frontend-format-check/frontend-test.
Inspect light/dark desktop/mobile popovers. Verify settings remains reachable,
no unsupported actions appear, and offline logout protection stays intact.

# Impact

Presentation and settings entry-point change only; no new product features/API.

# Loop Alignment

UI composition reuses shared avatar/theme controls. API/realtime/recovery loops
retain their current ownership; no transport or session changes.

# Verification

Child make check/test/build/test-ui passed (52 tests, 16 browser cases). Root
frontend-format-check/frontend-test passed. Reviewed light/dark 390px/1440px
profile popovers and sidebar screenshots. Existing browser cases now navigate
to settings through the profile menu; keyboard dismissal, viewport bounds,
coarse-pointer sizing, and offline logout tests pass. No required checks skipped.

# Commit Title

style(ui): compact sidebar and align text brand

# Changed File Scope

AppSidebar, shared CSS, en/ko locales, existing layout test dimensions, English/Korean frontend guides, this worklog.

# Reason

The expanded header should show only B4A text at the left edge, aligned with the menu icons and without a hover fill.

# Design

Remove BrandMark only from the expanded link, reuse nav.brand with B4A in both
locales, and left-align the link with the same 12px horizontal padding as menu rows.
Limit the brand hover fill to the collapsed state. Keep collapsed hover
and the right close control unchanged.

# Verification Plan

Run make check/test/build/test-ui and parent frontend-format-check/frontend-test.
Inspect expanded mobile and desktop header placement in the browser.

# Impact

Use 52px collapsed / 184px expanded desktop widths, 32px icon controls, 36px
menu rows, and 12px header/nav gap. Preserve 44px coarse-pointer controls.

Small visual change to the expanded sidebar header; no API or dependency changes.

# Loop Alignment

UI composition reuses the existing brand link and global CSS. API state, realtime,
and desktop recovery loops are unaffected because only header presentation changes.

# Verification

Passed child make check/test/build/test-ui (52 tests, 16 browser cases) and root
frontend-format-check/frontend-test. Reviewed 390px/1440px light/dark screenshots:
text-only brand aligns with menu icons, has no hover fill, and compact sidebar
retains the right close button and touch targets. No required checks skipped.

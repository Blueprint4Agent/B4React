# Commit Title

feat(ui): share resizable sidebar and compact settings

# Changed File Scope

AppLayout/AppSidebar/resize handle, SettingsPage, public/auth/profile/titlebar
legacy toggle usage, showcase, CSS, browser/component tests, bilingual guides.

# Reason

Settings must use the same sidebar, B4A header, and collapse control as the app,
with Back to app directly below the header rather than separate navigation markup.

# Design

Keep one AppSidebar mounted in AppLayout. Switch its navigation items for settings
routes, driven by validated section query parameters also read by SettingsPage.
Keep shared animation/brand/footer behavior. Default expanded width becomes 224px;
add a pointer-captured, keyboard-operable 200–360px resize separator and persist
width in local storage. Clamp mobile panel width to leave backdrop space.
Increase borderless menu hover contrast to a 12% foreground mix. Remove the duplicated settings
aside and CSS. Retain preview cards and thin borders. Keep legacy theme toggle components in the showcase only; remove
all public/auth/profile/titlebar instances. Root theme initialization remains.
Compact profile into a photo row and grouped identity fields, preserving mutations.
Separate the logout row from its divider and fit the profile popup to the expanded
sidebar inner width so it follows resizing.

# Verification Plan

Run check/test/build/test-ui and parent frontend-format-check/frontend-test.
Verify shared header/collapse/return behavior at mobile/desktop widths, query-driven
settings sections and theme persistence, and API-key component regressions.

# Impact

Settings shares app navigation chrome; no new backend features or dependencies.

# Loop Alignment

UI composition reuses AppSidebar; settings owns domain hooks. API/realtime/recovery
loops remain unchanged; connectivity stays in the shared sidebar footer.

# Verification

Passed child make check/test/build (52 tests) and test-ui (19 browser cases),
plus root frontend-format-check/frontend-test. Browser coverage verifies theme
persistence, shared settings header, navigation, pointer and keyboard resizing,
width persistence across routes/reload, matching popup width and mobile bounds.
Reviewed light/dark 390px/1440px screenshots of General/Appearance/Profile.
Updated component tests for shared route links and removed runtime theme controls;
JSDOM ResizeObserver is stubbed while Playwright verifies real geometry.
No required checks skipped.

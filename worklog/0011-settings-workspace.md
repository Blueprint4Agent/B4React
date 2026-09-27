# Commit Title

style(ui): reorganize settings with appearance previews

# Changed File Scope

AppLayout, SettingsPage, shared theme preview control/showcase, CSS, locales,
layout browser tests and bilingual guides.

# Reason

Use a dedicated settings navigation/content layout and visual theme previews
matching the supplied reference, without adding unsupported settings.

# Design

Settings uses its own left navigation and return-to-app link instead of two
sidebars. Preserve native titlebar and connectivity status. Separate existing
language and appearance settings; retain profile/API-key hook behavior. Add a
shared accessible system/light/dark preview selector and showcase example.
Use responsive settings panels and mobile navigation without horizontal overflow.
Thin card/sidebar borders to 0.5px with softer contrast. Menu/dropdown/profile
hover uses background only, preserving keyboard focus and selection outlines.

# Verification Plan

Run child check/test/build/test-ui and parent frontend-format-check/frontend-test.
Check appearance selection and persistence, settings return navigation, profile
and API-key regressions, and mobile/desktop light/dark screenshots.

# Impact

Settings presentation and theme selection change; no new backend features or APIs.

# Loop Alignment

UI composition reuses MenuList, PrimaryCard, existing controls and new shared theme
selector. API/realtime hooks and desktop recovery ownership are preserved; settings
keeps connectivity retry visible. Backend loops are not applicable.

# Verification

Passed child make check/test/build (52 tests), make test-ui (18 Chromium cases),
and parent frontend-format-check/frontend-test. Reviewed 390px/1440px light/dark
General/Appearance/Profile screenshots and corrected inherited content width and
mobile grid row spacing. Existing menu-height expectations were updated for the
compact settings navigation; preview labels use existing localized mode names.
A concurrent old browser run shut down the shared test server; rerunning the final
browser suite alone passed all 18 cases. No required checks skipped.

# Commit Title

feat(ui): add platform-aware shortcut hints and actions

# Changed File Scope

Shared KeyboardShortcut component/export/showcase, shortcut utilities/hook,
AppLayout/sidebar/profile integration, dropdown geometry, locales, tests and bilingual guides.

# Reason

Provide reusable shortcut hints matching macOS and Windows/Linux keyboard labels,
then connect discoverable app actions to the same shortcut definitions.

# Design

Use existing platform detection with a primary-modifier abstraction. Render Mac
symbols and Ctrl/Alt/Shift labels elsewhere, with accessible key names. Register
Mod+B for sidebar toggle and Mod+, for settings; display hints on those actions.
Ignore typing/composition/repeat/AltGraph/default-prevented events and modal dialogs.
Keep visual hints and key matching sourced from shared definitions. Showcase native
and explicit platform examples. No backend or domain-state changes.

# Dropdown follow-up design

Match the shared dropdown menu width to its trigger instead of a separate 10rem
minimum; anchor it 4px below the trigger and wrap long option labels.
Use 32px desktop trigger/item minimum heights, 13px regular text, 8px horizontal
padding, a 120px trigger minimum width and 44px coarse-pointer targets.

# Verification Plan

Run child check/test/build/test-ui and parent frontend-format-check/frontend-test.
Test formatting and exact modifier matching across Mac/Windows/Linux, typing/modal
exclusion, actual browser navigation/toggle, and tooltip/profile hint geometry.

# Impact

Two app-shell keyboard shortcuts become available outside editable/modal contexts.
Normal browser typing, IME composition and modal workflows are preserved.

# Loop Alignment

UI composition uses a shared hint component and hook. API/realtime/desktop recovery
loops are unchanged; no transport or mutation behavior is added.

# Verification

Child make check/test/build passed; 55 Vitest tests passed.
Child make test-ui passed all 26 browser cases, including native platform chords
and dropdown alignment at 390px/1440px. Root frontend-format-check/frontend-test
passed. Reviewed dark-mode dropdown and compact shortcut screenshots.
The initial browser selector used the Korean label in an English UI; corrected
the test to select Korean before asserting the localized trigger label.

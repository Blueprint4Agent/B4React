# Commit Title

fix(ui): simplify server unavailable layout

# Changed File Scope

ServerUnavailablePage.tsx, app.css, App component tests, English/Korean test and page-family documentation.

# Reason

Remove public navbar and reuse the main sidebar with a single calm recovery panel.

# Design

Reuse AppLayout, PanelCard and Button; replace nested WarningCard with muted status text.

# Verification Plan

Typecheck and existing config retry browser regression; scoped Make verification before any commit.

# Impact

Visual composition only; config retry and delayed loading remain intact.

# Loop Alignment

UI composition reuses app shell. Desktop recovery unchanged. No domain API or realtime changes.

# State Ownership

Existing page checking props and delayed indicator state remain unchanged; AppLayout owns sidebar state.

# Memoization

No expensive repeated child introduced; small context-driven recovery panel needs no memo wrapper.

# Performance Evidence

No optimization claimed; config-sharing browser test checks single config request and recovery.

# Verification

`make verify-plan` selected UI scope; `make verify` passed check/test (119 tests), the full browser UI suite (106 tests) and production build. Initial failures in App tests were fixed by matching the actual ToastProvider tree and asserting sidebar instead of the removed navbar. Existing config-sharing browser suite passed 4/4. Four Korean mobile/desktop light/dark peer comparisons passed. Production route recovery and style-studio browser suites were omitted by the UI classifier because routing/configuration/tooling did not change; native desktop runtime was not exercised. Existing component tests cover offline sidebar status and delayed retry. Planned Git metadata validation passed; actual PR metadata validation follows creation.

# Page Family

## Family

Main app shell recovery state.

## Reference

AppLayout.tsx and ShowCasePage.tsx app route shell.

## Shared Rules

Existing sidebar, content container, panel typography and shared Button.

## Exceptions

Center one bounded recovery panel because bootstrap configuration is unavailable.

## Evidence

Compared recovery and showcase at 390/1440px, light/dark, Korean locale: identical sidebar geometry/background and main padding/width, no horizontal overflow or public navbar. Screenshots and geometry: /tmp/server-unavailable-review/. Visually reviewed mobile dark and desktop light recovery screenshots.

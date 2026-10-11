# Commit Title

feat(home): introduce the project with light-first product previews

# Changed File Scope

HomePage, MainPageTemplate content placement, app.css, EN/KO locales, screenshots, browser coverage and home documentation.

# Reason

Replace a sparse home with a clear project introduction and real product previews while retaining account navigation.

# Design

Static editorial hero, local screenshot gallery and capability overview inside MainPageTemplate. Optional content placement before navigation. Retain auth/config filtering. Capture isolated demo UI without private data.

# Verification Plan

make verify-plan then make verify; compare Home and General at mobile/desktop in light/dark, image loading, preview switching, navigation and overflow.

# Impact

Home presentation only; screenshots are illustrative. No API or schema change. Preserve user theme and language.

# Loop Alignment

Reuse template, Button and tokens. Auth/config own navigation. No new API mutations, realtime subscriptions or desktop recovery loops.

# State Ownership

Preview selection is local component state, reset on unmount; existing providers retain auth/config/translation. No store or persistence.

# Memoization

Small static content has no frequent updates or expensive repeated children; no blanket memoization. Locale and preview updates remain necessary.

# Performance Evidence

Four local WebP images total 84,216 bytes (5,990–37,990 bytes each). Production HomePage chunk is 6.47 kB / 2.21 kB gzip. No new API hooks or subscriptions; no latency optimization claimed.

# Verification

make verify-plan selected full frontend verification because shared CSS/template and assets changed. make verify passed: hooks, check, 147 unit/component/integration tests, 188 browser tests, 10 production route tests, 3 style-studio tests. No selected checks omitted. Browser preview switching and decoded local images are covered in runtime-modes.spec.ts.

# Page Family

## Family

Home in the settings/main shell with project introduction content.

## Reference

MainPageTemplate and SettingsPage General.

## Shared Rules

Preserve shell width, header spacing, Button, row surfaces and responsive sidebar.

## Exceptions

Hero typography and preview framing confined to home content, preserving header/navigation styles.

## Evidence

runtime-modes.spec.ts compared Home with General at 390/1440px in light/dark: identical shell width, padding, header margin and row surface geometry; no horizontal overflow. Role filtering, guest login and Korean long-name checks passed. Actual screenshots inspected at /tmp/b4-home-ko.png, /tmp/b4-home-mobile-ko.png, /tmp/b4-home-dark-mobile-ko.png and /tmp/b4-settings-ko.png. The screenshots are local review artifacts; browser suite output is overwritten by later suites.

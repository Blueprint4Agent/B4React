# Commit Title

feat(layout): add service layout modes and development preview

# Changed File Scope

Shared frontend shell, development Appearance settings, local layout preference, service default configuration, EN/KO documentation and browser/component coverage.

# Reason

Let service authors choose sidebar, top navigation or focused layouts and preview all three from Appearance in server development mode.

# Design

Keep sidebar as the service default in src/service.config.ts. Share navigation, authorization and profile controls across three shell presentations. A scoped provider owns the validated browser-local development preview; production and unknown server modes always use the service default. Reuse shared Button/Tooltip and settings row composition; preview buttons use content-driven height and a stable three-column diagram grid. Settings/admin context menus stay out of global top navigation: use a boxed left navigation beside content, with a mobile disclosure. Verify home/profile/inbox/auth and recovery shells too. No backend contract changes.

# Verification Plan

Run make verify-plan and make verify; inspect browser mobile/desktop light/dark layout, keyboard and profile navigation; verify production ignores stored previews. Run parent integration checks after the child merge.

# Impact

Existing sidebar remains default. Development preview persists only in this browser and does not modify deployment defaults. Topnav and focused retain settings/profile/login and role-filtered navigation.

# Loop Alignment

UI composition reuses shared controls and navigation. API state and realtime ownership remain unchanged; no new requests or background tasks. Desktop recovery status and offline logout guard remain reachable in every layout. Backend event/task loops do not apply to this frontend-only behavior.

# State Ownership

Service layout is immutable source configuration. App-level LayoutProvider owns rare development preference changes and browser-scoped persistence; disclosure state remains local to AppLayout. No Zustand or Redux is needed.

# Memoization

Shell and selector render trivial navigation and update on context or props changes. No expensive stable-prop boundary is introduced; preserve the existing protected admin table memoization.

# Performance Evidence

Browser tests confirm layout switching adds zero /config requests. Provider tests retain an unsaved input draft through preview and server-mode changes. Production entry is 509.17 kB (158.65 kB gzip), CSS 132.15 kB (23.07 kB gzip); no latency or bundle-reduction claim. Protected admin memoization tests remain passing.

# Verification

`make verify-plan` selected full frontend verification because shared shell/config/locale structure changed. `make verify` passed hooks-test, check (architecture/UI/state policies, types, formatting and fixtures), 195 unit/component/integration tests, 227 browser UI tests, production build plus 10 route tests and 11 public-discovery tests, and 3 style-studio browser cases. First UI run exposed two obsolete native-title assertions; replacements verify visible account identity and the guest accessible name with the new shared Tooltip. Final complete UI suite passed. Backend/Rust checks are not applicable: no backend or native-shell implementation changed. Parent contract/packaging validation follows the child merge. Local logs: `.git/verification-logs/` (submodule Git directory).

# Page Family

## Family

Persistent application chrome plus existing Settings family.

## Reference

AppLayout/AppSidebar and SettingsPage General/Appearance are canonical peers.

## Shared Rules

Keep shared theme surfaces, control dimensions, settings header spacing, 50rem content family, profile menu and mobile touch targets.

## Exceptions

Topnav moves navigation above content; focused uses transparent compact chrome with a fixed left menu icon and anchored navigation; direct resource links remain visible. Page content and role filtering remain shared.

## Evidence

`tests/e2e/runtime-modes.spec.ts` compares Appearance/General menu positions at 390/1440px in light/dark for all three modes; preview/label bounds, popup bounds and icon hover/keyboard dismissal pass. Generated sidebar/topnav/focused appearance and general-peer PNGs were visually inspected; mobile extra grid space and fixed-height preview overflow were corrected. Korean home/profile/inbox/admin/Appearance checks pass at both widths, including role-gated sections and the mobile menu-to-heading gap. Existing billing/account/auth family suites pass. Settings cards disable translation and reserve scrollbar width; minimal header transparency is asserted. Screenshots are transient Playwright test-results artifacts, cleaned by subsequent suites.

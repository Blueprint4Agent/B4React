# Commit Title

feat(home): refresh feature overview and role-aware navigation

# Changed File Scope

Home overview/locales/shortcuts, profile menu visibility, showcase sidebar icon, read-only synthetic inquiry demo, role/browser tests and localized documentation. Parent integrates the merged child gitlink.

# Reason

Expose recently added inbox, inquiries, profile and realtime capabilities and remove the redundant demo entry for administrators.

# Design

Reuse the existing home capability grid and shortcut family. Add concise accurate descriptions: SSE is connected; WebSocket is an opt-in provider template. Hide only the administrator demo menu for admin role while retaining the real panel and public demo for others. The inquiry demo reuses the real inquiry composition with localized synthetic fixtures; disable HTTP reads/writes and hide mutation controls. Use the Blocks icon for the component showcase.

# Verification Plan

Root make verify-plan/verify; role menu regressions, mobile/desktop light/dark home comparisons and shortcut destinations.

# Impact

Frontend presentation/navigation only. No API, schema, permissions or image build changes.

# Loop Alignment

Existing auth/config snapshots own role and visibility. No added requests, realtime subscriptions or desktop recovery path. Reuse home grid, sidebar links and icons.

# Verification

Root make verify-plan/verify selected full frontend verification with backend=False. Typecheck/static/policy checks passed; 168 frontend tests, 212 browser tests and 10 production route/branding tests passed. Style-studio, contracts and packaging checked. Focused home/demo run passed 26 tests; demo makes zero inquiry API requests, hides mutations and rejects direct routes when disabled. Parent integration reuses matching receipts and validates packaging. Backend tests omitted by classifier because no backend/API/schema code changed. No Docker/GHCR build, per user preference.

# State Ownership

AuthProvider and AppConfigProvider remain owners; overview selection stays local. Capabilities are module constants; inquiry fixtures are memoized by locale, selection/filter remain existing URL/local state and live HTTP is disabled in demo. No new store.

# Memoization

No new memo boundary: small static cards have no costly derived data; locale/context updates must remain visible.

# Performance Evidence

Home browser checks confirm public previews make zero private admin requests. The inquiry demo performs zero inquiry HTTP requests through navigation and reload; existing memoized message rendering receives stable localized fixture arrays. No performance improvement claim.

# Page Family

## Family

Existing home overview/MainPageTemplate and sidebar/profile dropdown.

## Reference

ProjectOverview capability grid, HomePage shortcut list, AppSidebar and ProfileDropdown menu rows.

## Shared Rules

Reuse all existing grid spacing, surfaces, typography and responsive rules. Icons come from the installed Lucide set.

## Exceptions

No visual family exception; new capability cards use the same markup.

## Evidence

Home geometry matches the Settings General peer at 390px/1440px in light/dark. Inspected home-features.png under runtime-modes-production-home-matches-settings-light-at-1440 and dark-at-390, plus admin-demo-inquiry-demo-us-83a1b--mutating-private-inquiries/demo-inquiries.png. Existing capability row spacing, shortcut surfaces and inquiry message composition are reused; no CSS overrides.

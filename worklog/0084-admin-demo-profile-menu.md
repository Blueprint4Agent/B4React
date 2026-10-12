# Commit Title

fix(admin): move demo entry into profile menu

# Changed File Scope

Profile dropdown, sidebar entry, localized label, demo browser coverage and documentation.

# Reason

Place the demo beside the existing administrator entry as requested, rather than in the main sidebar navigation.

# Design

Pass a demo-enabled boolean from AppSidebar to ProfileDropdown. Reuse the existing administrator link structure with the label Admin panel (demo) and /demo/admin destination. Keep real administrator access independent. Remove only the main sidebar entry; retain demo section navigation and home preview links.

# Verification Plan

Run make verify-plan and make verify for the full branch range. Existing demo browser cases exercise dropdown navigation, disabled visibility and administrator peer geometry.

# Impact

Navigation-only change; API/config/data behavior unchanged. No image build or publication for this patch, per user preference.

# Loop Alignment

Existing menu state, pathname dismissal and UI composition remain owners. API/realtime/connectivity behavior is unchanged; no backend lifecycle/event/task changes.

# Verification

make verify-plan selected UI scope with broad shared-component suites. make verify passed check, 165 unit/component/integration tests, 196 browser tests and web build. Container image build/publication was not run. Backend and extra production-route/style-studio suites were omitted by the classifier because this changes only existing UI navigation, not backend, chunks or tooling.

# State Ownership

App config owns visibility; ProfileDropdown retains local open state. No additional state/store.

# Memoization

Existing menu has local open/close updates; a single conditional link is not an expensive stable-prop boundary. No new memoization.

# Performance Evidence

Navigation tests verify no private API requests for visitors. No performance improvement claimed.

# Page Family

## Family

Existing profile dropdown.

## Reference

ProfileDropdown administrator and settings links.

## Shared Rules

Reuse profile-menu\_\_item and its Shield icon wrapper, spacing, keyboard focus and dismissal behavior.

## Exceptions

Demo label and destination differ; no styling exceptions.

## Evidence

Existing five demo cases pass at 390/1440px in light/dark, including the dropdown entry and no sidebar duplicate, disabled visibility and separate real-admin link. Inspected test-results/admin-demo-public-demo-reuses-administrator-family-390-light/demo-profile-menu.png; the new entry shares the existing Settings/Admin icon, row spacing and popup surface. Administrator page geometry still matches.

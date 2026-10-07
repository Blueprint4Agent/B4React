# Commit Title

feat(auth): apply runtime modes and manager navigation

# Changed File Scope

Environment example value-format comments, public config contract, mode-aware routes/navigation, manager read-only directory, localized labels and browser coverage.

# Reason

Separate development-only entry points from authenticated production before adding a read-only manager role.

# Design

Phase 1: APP_MODE development/production, production requires login, dedicated bootstrap identity with no email-collision promotion; mode-aware safe home and hidden/blocked developer routes. Phase 2: manager can read directory/statistics only; CLI role assignment retains last-admin protection and records audit events. Adopt coordinated API contract in B4React, merge child before parent pin.

# Verification Plan

Full make verify-plan / make verify, role and mode authorization/DB tests, contract generation, production route and UI checks. Compare shared sidebar/settings/admin family at mobile/desktop in both themes.

# Impact

Existing users retain roles. Development remains the default for existing local environments; deployment example explicitly selects production. Production disables bootstrap identities and requires authentication. No application role mutation API is added.

# Loop Alignment

Keep router/dependency/service/repository ownership; roles are read from DB each request. UI consumes shared config/auth owners, revalidates role data via existing auth lifecycle. No new realtime or background operation is needed; role writes/audit are transactional.

# State Ownership

Server owns mode and roles; shared config/auth providers expose them. URL owns directory filters. No new global store.

# Memoization

Preserve memoized AdminUserTable and stable query ownership; trivial guard/navigation changes need no extra memo boundary.

# Performance Evidence

No performance claim; validate config deduplication and existing table render tests plus role changes on existing tokens.

# Verification

Full root-delegated verification passed: frontend check/test (125 tests, 34 files), browser UI (114 tests), production routes (8 tests), Style Studio (3 tests), contract/package validation. Focused runtime/admin browser checks passed 11 tests. No checks intentionally omitted; final child make verify-plan / make verify also passed after environment-comment synchronization, reusing matching delegated checks and running child hooks/production routes. Existing local environment values were preserved and template synchronization passed.

# Page Family

## Family

Existing shared application sidebar, authentication dialogs and admin user directory.

## Reference

AppSidebar, SettingsPage account and AdminPage user table remain canonical peers.

## Shared Rules

Reuse existing shells, button styles, typography and responsive layout; production authentication omits the developer showcase backdrop.

## Exceptions

Development-only navigation is absent in production; managers gain the existing read-only admin directory, not administrative mutations.

## Evidence

Compared production manager screenshots at 390px/light and 1440px/dark with the development admin directory at 1440px/light in /tmp/runtime-modes-review. Same sidebar, title spacing, table, typography and filters; four summary cards wrap into two columns on mobile and only the table scrolls horizontally. Automated coverage also checks 390px/dark and 1440px/light, direct showcase denial, guest login and ordinary-user denial. Existing settings/admin family and responsive browser checks passed.

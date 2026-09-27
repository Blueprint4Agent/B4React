# Commit Title

fix(auth): respect login availability and deduplicate recent accounts

# Changed File Scope

ProfileDropdown, AppSidebar, recentAccounts utility, regression tests and guides

# Reason

Manage roles outside the UI and respect disabled login in profile actions.

# Design

Collapse same-email login history across providers, retaining the latest method and normalizing existing storage. Pass explicit login availability to the existing profile component; render identity without switching controls when unavailable.

# Verification Plan

Run root Make check/test; frontend check/test/build; validate staged Git governance.

# Impact

No new role configuration UI or public API. Existing authentication remains compatible.

# Loop Alignment

CLI is outside HTTP lifecycle; no background tasks or realtime events needed. Backend authorization reads current DB roles. Frontend reuses config state and shared profile composition; connectivity recovery is unchanged.

# Verification

Passed parent `make check` and `make test`; after history changes passed child `make check test build` (67 tests) and `make test-ui` (46 browser cases). The new history browser assertion initially included showcase fixtures; scoped it to the auth dialog and reran successfully. No required checks skipped.

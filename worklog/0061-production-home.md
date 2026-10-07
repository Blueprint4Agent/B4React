# Commit Title

feat(home): add extensible default home

# Changed File Scope

Make test-ui now includes runtime-mode/home regression coverage. Shared default home routing in both runtime modes, shared-sidebar home destination, localized home content, browser coverage and integration documentation.

# Reason

Production has no default content page after hiding the developer showcase and currently redirects signed-in users into account settings.

# Design

Provide a minimal public home using the existing application shell and settings-family header/surfaces. Show real account greeting and shortcuts to account, billing, preferences and role-allowed directory. Guests see generic navigation and sign in for account access. Both modes default to home; development alone retains a separate showcase link. Login success, logout, auth close and page recovery return home. Preserve admin billing and subscription behavior unchanged. No fabricated metrics or new APIs. Follow-up scope: extract MainPageTemplate with typed menu items, list/grid arrangement, header actions and children slots; demonstrate extension in the developer showcase and localized docs.

# Verification Plan

Root Make verification, production home and auth/redirect browser checks, responsive light/dark English/Korean peer comparisons, production chunk loading and recovery.

# Impact

Both runtime modes use /home for root/dashboard and auth completion/close. Production redirects showcase URLs home; development exposes a separate showcase menu. Guest home contains no private account data. Existing setting destinations remain available.

# Loop Alignment

Reuse shared auth/config ownership and existing connectivity recovery. No API fetches, realtime subscriptions, mutations, domain events or background tasks are added.

# Verification

Final make verify-plan / make verify selected full frontend verification and passed: 125 tests across 34 files, 131 browser UI tests (including runtime/home coverage now in Make), 9 production route tests and 3 Style Studio tests. All checks passed; none intentionally omitted. Both runtime modes default to home, developer showcase remains a separate link, guest home exposes no private account data, and login/close/recovery return home. Existing admin billing/subscriptions are unchanged. Mac/Windows/Linux shortcut regressions pass after updating their navigation to explicitly select the showcase.

# State Ownership

Existing auth/config providers own account and mode; the router owns navigation. Home filters role-aware menu items. MainPageTemplate owns presentation only and introduces no local state, global store, requests or persistence.

# Memoization

Small static navigation cards and context-driven greeting do not warrant memo boundaries. Preserve existing provider ownership and expensive table boundaries; do not add blanket memoization.

# Performance Evidence

No performance improvement claimed. Home consumes existing auth/config with no new data hooks. Config-sharing regression tests pass, as do production lazy-route loading/recovery and the complete UI suite.

# Page Family

## Family

Application home built from the settings family.

## Reference

SettingsPage General: shared settings-layout, settings-content-card, header and settings-row surfaces. AppSidebar remains the shared shell.

## Shared Rules

Reuse width, padding, header gap, typography, rounded row surfaces and theme tokens. Navigation links use the shared surface with scoped link hover/focus behavior.

## Exceptions

Rows navigate instead of containing configuration controls; the heading greets the authenticated account. Admin shortcut is visible only to admin/manager.

## Evidence

MainPageTemplate owns reusable presentation; HomePage owns auth and role filtering. Compared General and Home at 390/1440px in light/dark. Computed card width/padding, header gap, row padding/border/radius/background match exactly; corrected duplicate mobile shell padding by sharing the settings-family shell. Screenshots in /tmp/production-home-review include stable General/Home, Korean long-name wrapping, and responsive showcase grid/actions/content. Menu links and back navigation work; ordinary users never receive the directory shortcut and guests see generic home content and sign in for account access.

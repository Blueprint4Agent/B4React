# Commit Title

refactor(ui): replace app navbar with persistent sidebar rail

# Changed File Scope

App/layout components, Button/MenuList styles, global CSS, locales, layout/browser
tests, English/Korean guides, and this worklog.

# Reason

Use the supplied narrow sidebar reference: brand at top, navigation icons below,
profile at bottom, no browser app navbar. Correct uneven menu padding and icon gaps.

# Design

Introduce reusable AppLayout for all protected and authenticated not-found routes.
Move existing profile/theme/logout/connectivity state from AppNavbar to AppSidebar;
remove the obsolete navbar. Preserve collapsed/expanded sidebar states with a
200px expanded width, header toggle, visible labels, and profile name. Mobile
expansion overlays content with a dismissible backdrop. Preserve public/auth layouts and
native desktop drag/window controls. Profile popover opens beside the lower rail,
with keyboard focus/escape and mobile bounds. Use compact 56px rail / 36px rail buttons / 40px controls on desktop, with
44px coarse-pointer targets, narrower menus/popovers, and 20px card padding.
Brand hover swaps to an expand icon; expanded header closes from its right edge.
Animate width/content inset over 180ms with reduced-motion support and the same
background in both states. Compact tooltips to 12px/16px text, 4px/8px padding,
and 6px radius. Dismiss interrupted navigation hover on outside pointer movement.
Normalize shared Button label layout
and MenuList geometry instead of adding page-specific compensating margins.

# Verification Plan

Run child make check/test/build/test-ui and parent frontend-format-check/test and
contract-check. Inspect showcase/settings, profile popover, menu alignment and
light/dark desktop/mobile layouts. Regress connectivity logout protection and native
drag controls. Preserve hover-dismissal cases.

# Impact

App navigation remains available on settings/error screens. Profile/theme move to
sidebar bottom. No backend/API/dependency changes. Public/auth navigation stays.

# Loop Alignment

UI composition: shared AppLayout/AppSidebar/ProfileDropdown/Button/MenuList.
Desktop recovery: preserve retry and offline logout blocking near the profile.
API state and realtime refresh: no changes to domain hook ownership or lifecycle.

# Verification

Passed child `make check`, `make test` (52 tests), `make build`, and
`make test-ui` (16 Chromium cases). Parent `make frontend-format-check
frontend-test contract-check` passed. Screenshot review covered 390px/1440px,
light/dark, expanded/collapsed, profile popovers, settings, and full-width menu rows.
The toggle-placement assertion now waits for the new width transition to finish.
Native titlebar dragging and offline logout guards pass component tests; no native
packaging changes were made. No required checks skipped.

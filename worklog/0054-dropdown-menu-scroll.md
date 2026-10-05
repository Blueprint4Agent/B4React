# Commit Title

fix(ui): preserve scroll in floating dropdown menus

# Changed File Scope

Shared DropdownMenu placement, country-list browser regression, frontend guides and worklog.

# Reason

The long country/region list resets instead of scrolling to later options inside the billing profile dialog.

# Design

Reproduce the wheel behavior on the long portaled menu. Separate menu-internal scroll from ancestor repositioning and preserve its scroll offset during resize/placement measurements. Keep viewport flipping and modal anchor recovery.

# Verification Plan

Country list wheel/bottom-selection and resize checks at mobile/desktop in light/dark; Make-selected UI checks plus existing portal/modal geometry and focus coverage.

# Impact

Shared long floating lists can scroll without changing existing selection or API payloads.

# Loop Alignment

UI composition uses the same shared DropdownMenu. Menu owns open/placement state; profile draft remains in the dialog. API/realtime/connectivity state is unaffected.

# Verification

`make verify-plan` selected UI scope. `make verify` passed checks/types and 119 frontend tests, 106 browser cases and production build. Production route/style-editor and hook-policy fixture suites are omitted by the UI-only classifier because routing, SDK/API and governance are unchanged; parent integration retains its full branch checks. Before correction the wheel regression failed with scrollTop=0; after correction all four mobile/desktop light/dark country cases passed.

# State Ownership

Menu owns local DOM placement/scroll, profile dialog owns selected country; no store added.

# Memoization

Placement event handling is the defect; no expensive React render boundary needs memoization.

# Performance Evidence

Wheel scrolling advances beyond 100px and survives viewport resizing; internal menu scroll no longer repositions the anchor. Four country regressions and the full 106-case UI suite passed; no latency claim.

# Page Family

## Family

Shared dropdowns in compact modal forms.

## Reference

Existing DropdownMenu modal portal and API-key creation dropdown.

## Shared Rules

Preserve trigger width, gap, viewport bounds, modal focus and anchor recovery; fix shared scroll ownership.

## Exceptions

Measured placement styles are the existing dynamic geometry exception.

## Evidence

`tests/e2e/billing.spec.ts` country-list cases passed at 390/1440px in light/dark, preserving offset after resize, reaching the final country and restoring focus after selection. `country-menu-bottom.png` screenshots show the final options within the viewport. Existing modal portal/anchor and compact action-menu checks passed in the 106-case UI suite.

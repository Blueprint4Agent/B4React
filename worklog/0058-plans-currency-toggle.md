# Commit Title

fix(billing): simplify plan currency selection

# Changed File Scope

PlansPage, shared SegmentedControl and showcase, compact control styles, English/Korean labels and guidance, existing billing and production-route browser tests and this worklog.

# Reason

Remove the two requested explanatory lines and make dollar/won options directly visible instead of a dropdown.

# Design

Keep standalone plan family shell and cards. Replace currency DropdownMenu with shared controlled SegmentedControl using symbol labels, localized accessible names, aria-pressed and existing theme tokens. Share the compact control with an interactive/disabled showcase. Remove subtitle, existing-currency paragraph and pending-plan status card from the plan selection page. Retain pending-change details in Billing settings. Allow URL-based price preview switching for existing subscribers too. Keep checkout currency for new subscriptions and use the actual subscription currency for plan-change confirmation.

# Verification Plan

Run make verify-plan then make verify. Extend existing mobile/desktop light/dark plan coverage for direct selection, selected state and removed copy; check paid-subscriber preview switching with actual-currency confirmation. Inspect screenshots.

# Impact

Presentation and selection interaction only; no payment API or subscription mutation changes.

# Loop Alignment

URL remains display currency owner for new subscribers, subscription snapshot remains the actual billing currency owner. API/realtime/connectivity loops remain unchanged; no backend loop changes. Shared Button owns controls.

# State Ownership

Reuse URL currency and existing server subscription as the default preview and actual charge currency; no new local state or store.

# Memoization

Two trivial buttons require no expensive stable-prop boundary or new memoization.

# Performance Evidence

No speed claim. Existing browser checks passed price updates, URL persistence and zero extra config calls; no new state owner or request path was added.

# Verification

make verify-plan selected full frontend scope because locale keys changed. make verify passed hooks, 122 tests, 114 UI browser cases, 7 production-route cases/build and style-studio fixtures/browser checks. Updated the production route test from dropdown locators to symbol control accessibility names. The first style-studio attempt encountered the temporary visual-review server on port 4175; stopped that server and reran only the outstanding check through make verify using matching receipts. Backend checks are not applicable; no backend code/contracts changed.

# Page Family

## Family

Standalone plans.

## Reference

PlansPage canonical standalone shell and existing plan-card pill actions; shared ThemeToggleButton demonstrates grouped selection.

## Shared Rules

Retain standalone close/scroll, width, card spacing, typography and shared Button states. Use theme tokens and 28px desktop controls and at least 44px coarse-pointer targets.

## Exceptions

Remove requested subtitle, currency explanatory line and pending-plan card. Two visible currency options replace the dropdown within the same card toolbar position.

## Evidence

Compared the canonical standalone plan cards and shared controls at 390/1440px in light/dark. Four Korean paid-subscriber browser cases confirmed dollar preview switching and no pending-plan banner. Visually reviewed mobile light plans and desktop dark showcase: compact right-aligned controls, preserved card shell and no extra copy. Shared browser checks verify keyboard selection, disabled showcase controls and hover contrast. A touch context confirmed 44px minimum targets. Artifacts: /tmp/plans-currency-review/.

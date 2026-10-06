# Commit Title

style(billing): place add-card icon after its label

# Changed File Scope

src/pages/billing/BillingSettingsPage.tsx and this worklog.

# Reason

Commit the user-staged adjustment moving the add-card plus icon after the button label.

# Design

Preserve the existing shared text Button, accessible text, click handler and section-action-header. Only reorder its two children. The user supplied the implementation before this worklog was prepared.

# Verification Plan

Run make verify-plan and make verify for the staged UI change. Review existing billing mobile/desktop light/dark screenshots and peer section actions.

# Impact

Visual icon placement only. No API, state, translation, CSS or public interface changes; this worklog documents the adjustment.

# Loop Alignment

Shared Button and section header composition are preserved. API state, realtime and desktop recovery loops are unchanged; backend lifecycle, events and background tasks are not applicable to this markup reorder.

# State Ownership

No state changes; billing hooks and page keep existing ownership.

# Memoization

No new expensive boundary; a two-child markup reorder does not benefit from memoization.

# Performance Evidence

No performance claim or added requests. Existing billing layout/interaction coverage passed for the same button behavior.

# Verification

make verify-plan selected UI scope. make verify passed check/test (122 tests), test-ui (114 browser cases) and production build. Production-route/style-studio checks were omitted by the UI classifier because routing/tooling did not change. Backend checks are not applicable to an icon-order change.

# Page Family

## Family

Settings billing section actions.

## Reference

BillingSettingsPage transaction View all and billing-profile Edit text actions; General settings shell.

## Shared Rules

Preserve shared settings surfaces, typography, section-action-header alignment, text Button styles and responsive rules.

## Exceptions

The add-card action places its plus icon after the label as requested; no shared style exception is introduced.

## Evidence

Existing billing browser comparisons passed at 390/1440px in light/dark, including General settings peer geometry. Visually reviewed test-results/billing-paid-subscription--fbee7-nd-billing-details-at-390px/billing-details.png and test-results/billing-billing-and-three-example-plans-fit-dark-at-1440px/billing.png: the plus follows the Add new label and matches neighboring View all/Edit section actions without wrapping or overflow.

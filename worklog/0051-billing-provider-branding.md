# Commit Title

fix(billing): align payment management with settings

# Changed File Scope

Billing settings, plan selection, locales, local brand assets, CSS and bilingual billing docs.

# Reason

Saved Link methods must be identifiable and explain where their underlying cards are managed. Payment provider identity should be visible using authentic logos.

# Design

Preserve card brand, masked last four digits and expiry. Use official Link artwork for Link rows and the official Powered by Stripe badge beside hosted checkout disclosure. Link rows direct users to Link to manage their wallet; no fabricated card details or unsupported provider claims. Assets served locally with provenance recorded.

Use the exact settings-account-delete composition and ModalButton danger for cancellation, including the Free confirmation. Pending-change undo stays neutral. Remove empty method groups so a Link-only list has no leading divider. Official monochrome Stripe badge follows light/dark theme.

# Verification Plan

Make verify-plan/verify and browser Settings/Plans checks at mobile/desktop with existing family comparisons.

# Impact

Presentation only; no new API, payment action or sensitive data collection.

# Loop Alignment

Existing API snapshot, focus/online refresh and desktop recovery remain unchanged; no realtime mutation or new state. Reuse shared Settings and pricing composition.

# State Ownership

Existing server-owned payment method snapshots; no new state.

# Memoization

Static small image nodes do not justify memo wrappers.

# Performance Evidence

Local SVG assets avoid third-party runtime requests. The existing 116 tests and 93 browser scenarios passed; no latency claim.

# Verification

UI scope selected: check/test (116 tests), test-ui (89 scenarios), build passed. Native desktop and live payment actions are not exercised for this presentation-only change. Backend, production route and style-studio checks omitted by the UI classifier because no API, routing or shared control contract changed. Final Make verification after account-deletion alignment passed. Four added Link-only mobile/desktop light/dark cases verify a single method group, loaded theme badge, no overflow, and danger actions in both row and dialog.

# Page Family

## Family

Settings and standalone pricing.

## Reference

SettingsPage account deletion section and AccountDeletionDialog; BillingSettingsPage alongside GeneralSettingsPage; existing PlansPage disclosure.

## Shared Rules

Keep existing shell, rows, typography, responsive spacing and actions.

## Exceptions

Official brand colors confined to small logos; no page color changes.

## Evidence

Existing General/Billing light/dark geometry comparisons passed at 390 and 1440 pixels. Reviewed test-results/billing-billing-and-three-example-plans-fit-light-at-390px/billing-methods.png and dark-at-1440px equivalent. Actual localhost signed-in Link row and Stripe badge visually confirmed after reload; final Link-only screenshots reviewed at test-results/billing-Link-only-billing--1f86c-nger-actions-dark-at-1440px/billing-provider-style.png and light-at-390px equivalent; card fixture still shows VISA, masked 4242, expiry and Default.

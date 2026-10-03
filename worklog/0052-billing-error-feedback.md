# Commit Title

fix(billing): consolidate duplicate error feedback

# Changed File Scope

BillingSettingsPage, browser regression coverage and bilingual billing notes.

# Reason

Subscription and payment details hooks can fail together and display the same error twice with inconsistent widths.

# Design

Compose translated page errors once, deduplicate identical messages, and render the existing compact InlineMessage within the existing billing-feedback wrapper. Keep subscription mutation errors inside the open confirmation dialog only. Preserve distinct errors and existing reload/recovery behavior.

# Verification Plan

Make UI verification; browser duplicate-error and recovery scenarios with mobile/desktop screenshots.

# Impact

Presentation only, no error suppression in API hooks or payment logic changes.

# Loop Alignment

Existing hook-owned API errors and focus/online/desktop recovery unchanged; no new realtime loop. Reuse shared InlineMessage and Settings feedback composition.

# State Ownership

Derive messages from hook snapshots during render; no new state or persistence.

# Memoization

Two short messages do not justify memoization.

# Performance Evidence

No added requests; concurrent-failure and successful-reload regression scenarios passed.

# Verification

Make verify-plan and verify selected UI checks: 116 tests, 95 browser scenarios and build passed. Backend, production-route and style-studio checks omitted by the UI classifier; no API, routing or shared control changes.

# Page Family

## Family

Settings feedback.

## Reference

SettingsPage account save feedback and existing BillingSettingsPage billing-feedback wrapper.

## Shared Rules

Existing shared InlineMessage, intrinsic-width feedback, page spacing and recovery controls.

## Exceptions

None; no shared styles changed.

## Evidence

Reviewed test-results/billing-billing-deduplicat-95ee9-rors-and-recovers-at-1440px/billing-error.png and 390px counterpart: one intrinsic-width alert without overflow. Existing General/Billing light/dark geometry comparisons also passed.

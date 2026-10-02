# Commit Title

fix(billing): use cancellation toasts and loading spinners

# Changed File Scope

Billing settings/plans, API key settings, shared Spinner/showcase, browser cases and bilingual guides.

# Reason

Cancellation should use the shared transient notification; loading should show a compact spinner instead of visible loading sentences.

# Design

Reuse useToast and consume cancellation query parameters with replace navigation, retaining the Billing section and unrelated query values. Add an accessible label-only Spinner option and use it in billing and API key loading surfaces. Keep server state and refresh ownership in domain hooks.

# Verification Plan

Make verify-plan/verify, browser cancellation deduplication after refresh/navigation and delayed response spinner cases, existing peer geometry/mobile/theme comparisons.

# Impact

No API/schema or billing behavior changes. Cancellation notices no longer occupy settings content. Accessible loading names remain available.

# Loop Alignment

API state and connectivity recovery remain domain-owned. No new realtime events. UI composition reuses ToastProvider, Spinner and existing settings rows.

# State Ownership

URL owns one-shot cancellation input, replaced after consumption; a page ref guards StrictMode replay. ToastProvider owns transient display. API hooks retain loading and data ownership.

# Memoization

No expensive repeated boundaries added; compact spinner and one effect do not benefit from memo wrappers. Existing stable toast dispatch is reused.

# Performance Evidence

Browser fixtures confirm toast expiry and no replay after focus, manual refresh and reload. Delayed API responses retain accessible spinners until data resolves. No latency improvement is claimed.

# Verification

Make verify-plan selected full frontend checks for 9 changed files. Make verify passed hooks, check/test (115 tests), browser UI (86 cases), production routes (7) and style studio (3). All selected checks ran; no backend validation applies to this child-only presentation change. Fifteen focused billing browser cases also passed. No real payment was submitted for this follow-up.

# Page Family

## Family

Settings, standalone plans and shared status overlays.

## Reference

SettingsPage general/developer sections, useToast/ToastCard and existing Spinner showcase.

## Shared Rules

Preserve settings shell/header/rows and standalone plans grid. Use shared toast capsule and spinner styles, including responsive sizing and accessibility.

## Exceptions

No new styling exceptions; only existing status composition changes.

## Evidence

tests/e2e/billing.spec.ts passed Billing-vs-General header/row geometry at 390/1440 in light/dark. Added both cancellation flows, mobile/desktop loading, API key loading and plan catalog loading cases. Visually reviewed test-results/billing-billing-loading-uses-accessible-spinners-at-390px/billing-spinners.png and test-results/billing-billing-checkout-c-18730-ast-and-consumes-the-return/cancellation-toast.png: shared settings rows retained; notification uses the existing top-center capsule. Existing shared toast tests cover light/dark and mobile geometry.

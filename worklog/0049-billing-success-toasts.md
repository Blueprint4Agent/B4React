# Commit Title

fix(billing): show verified success as a toast

# Changed File Scope

BillingSettingsPage, billing browser regressions and bilingual billing guides.

# Reason

Payment confirmation still appears inline although the user requested popup feedback.

# Design

Reuse the cancellation flow's shared ToastProvider for server-verified payment and card registration success. Consume only the confirmed return query while retaining Billing selection and unrelated parameters. Keep pending/error feedback inline and server verification unchanged.

# Verification Plan

Make verify-plan/verify; browser confirmation toast, return-query consumption, pending-to-paid, expiry and no replay after focus/manual refresh/reload; existing page-family comparisons.

# Impact

No API or payment-processing change. Completed payment and card registration confirmations become transient shared popups.

# Loop Alignment

API state and connectivity recovery remain in domain hooks; no billing realtime events or background projection. Shared toast maintains the UI composition loop.

# State Ownership

Domain hooks own verified results; the page consumes return parameters and guards duplicate dispatch using a ref; ToastProvider owns the visible popup.

# Memoization

No costly repeated boundary is introduced. Stable toast dispatch is reused; memo wrappers would not improve this small effect.

# Performance Evidence

Browser regressions passed: success toast expires and does not replay after focus, manual refresh or reload; no latency claim.

# Verification

Make verify-plan selected frontend UI scope for 5 files. Make verify passed check/test (115 tests), test-ui (86 browser cases) and production build. Routes/style-studio/backend checks were not selected because no routing, build, shared-control or backend implementation changed; parent integration retains its broader packaging checks. No actual payment was submitted.

# Page Family

## Family

Settings and shared notification overlay.

## Reference

Billing cancellation flow, SettingsPage toast feedback, ToastProvider and ToastCard.

## Shared Rules

Reuse existing top-center toast and retain Settings shell, rows and responsive layout.

## Exceptions

No new CSS or visual exceptions; pending status remains inline until the provider confirms completion.

## Evidence

tests/e2e/billing.spec.ts passed both verified success flows, pending-to-paid transition, toast-only rendering, expiry, query consumption and no replay on reload; Billing-vs-General geometry passed at 390/1440 in light/dark. Existing shared ToastCard browser cases retain responsive placement, contrast and focus evidence. No CSS or shell geometry changed.

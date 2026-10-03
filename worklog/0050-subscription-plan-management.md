# Commit Title

feat(billing): manage scheduled plan changes

# Changed File Scope

Generated contract, billing API/hook, plan/settings UI, localized copy, tests and documentation.

# Reason

Paid users need to switch to Free or change monthly/annual billing and undo a pending change.

# Design

Apply all changes at the current paid period end, without immediate charges or refunds. Stripe subscription schedules own future paid-plan changes; cancel_at_period_end owns Free transitions. Confirm effective date before submission, retain current plan until transition, show pending target and allow undo. Serialize owner mutations and reject stale confirmations; provider remains the source of truth. Unknown/provider-managed schedules are not overwritten.

The requested settings reference also adds real recent invoices, customer billing profile and a restricted Stripe portal for profile/card management. Retain the shared Settings family rather than copying screenshot colors; show actual provider defaults and no invented payment methods.

# Verification Plan

Owner/auth/stale request tests, provider schedule lifecycle and cancellation/undo, frontend confirmation and refreshed state, root Make verification and isolated Stripe sandbox smoke.

# Impact

Self-service plan changes become available for supported active single-item subscriptions. No entitlement/webhook projection or immediate refund behavior is added.

# Loop Alignment

API lifecycle follows router/service/repository; provider owns scheduled execution, so no local domain worker/event is needed. Frontend API snapshots/recovery and shared Modal/Button/toast composition remain in existing loops.

# State Ownership

Stripe owns current/pending subscription state; server validates target prices and stale versions. Hook owns snapshots/mutations; page owns confirmation selection. No new store.

# Memoization

No expensive repeated boundary introduced; three plan cards and a single controlled dialog do not justify memo wrappers.

# Performance Evidence

Hook regression confirms mutation locking, retry identity and stale account suppression. Browser journeys confirm pending/current distinctions and server-backed detail navigation; no latency claim.

# Verification

Make verify-plan selected full frontend checks for runtime/shared-control/styles/contracts. Make verify passed hooks, architecture/types/format, 116 tests, 89 browser UI scenarios, 7 production route scenarios and 3 style studio cases. No selected checks omitted. Backend schedule execution is provider-owned and is validated by the integrating repository; no local worker or SSE added.

# Page Family

## Family

Standalone plans, Settings and shared confirmation modal.

## Reference

Existing PlansPage, BillingSettingsPage and shared Modal/ModalButton.

## Shared Rules

Reuse existing page shells, settings rows, modal focus/scroll/actions and toast feedback.

## Exceptions

No new styling exceptions. Pending subscription details are domain content within existing rows.

## Evidence

tests/e2e/billing.spec.ts passed Billing-vs-General geometry at 390/1440 in light/dark plus Korean plan-change confirmation/undo/Free and portal/detail journeys. Reviewed screenshots under /tmp/b4-managed-billing-ui at 390/1440: grouped information rows retain shared settings surfaces, compact method menu and responsive invoice rows. Shared DropdownMenu compact variant is rendered in the showcase.

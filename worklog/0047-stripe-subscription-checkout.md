# Commit Title

feat(billing): connect plan selection to subscription checkout

# Changed File Scope

Typed billing contract/API/hooks, plans and settings composition, locales/docs and regression tests.

# Reason

Plan selection currently has illustrative prices and no subscription checkout; connect it to server-owned Stripe prices and verified subscription state.

# Design

Read Stripe recurring prices from a server allowlist. Create hosted subscription Checkout for the authenticated customer with durable per-customer reservations and provider idempotency. Verify ownership and subscription/payment state on return; read current subscription from Stripe rather than trusting the URL. Keep saved-card registration in Settings. Sandbox catalog uses the previously selected example amounts. No local entitlement grants or webhook projection in this initial integration; authoritative reads refresh on return/focus/recovery.

# Verification Plan

Provider-mocked API/domain/integration tests for price validation, ownership, duplicate requests and pending/failed returns; frontend state/navigation and family comparisons; Make verify-plan/verify, sandbox configuration read checks and hosted checkout smoke without submitting a payment.

# Impact

Monthly/annual cards open hosted checkout when server pricing is configured. Disabled/unconfigured states remain explicit. No automatic live charges or purchases during verification.

# Loop Alignment

Router/service/repository lifecycle, typed frontend domain hook, existing recovery loops and shared settings/plans composition. Stripe read-through status needs no asynchronous local projection; no webhook event/worker claims or paid entitlement enforcement.

# State Ownership

Server owns price allowlist and customer/checkout reservations. Stripe owns subscription truth; frontend owns only pending actions and snapshots.

# Memoization

Three small cards and modest settings sections need no extra memo boundaries; stabilize API hook and ignore stale account requests.

# Performance Evidence

Verify request counts and stale responses with tests; no latency claim.

# Verification

make verify-plan selected full frontend scope; make verify passed hooks, check/test (115), browser UI (80), production routes (7) and style studio (3). Subscription hook tests cover retry/duplicate locks, stale accounts, malicious/stale redirects, recovery and pending payment. Browser checkout/return and existing registration scenarios passed; desktop dark plans and mobile light billing screenshots inspected. General/Billing geometry comparisons remained equal across four viewport/theme cases. Initial formatting and guest-label assertion failures were corrected before this passing run. No selected checks omitted; native external-browser return and settled provider payment were not exercised.

# Page Family

## Family

Existing standalone plans and Settings Billing families.

## Reference

src/pages/billing/PlansPage.tsx and SettingsPage General/Billing compositions.

## Shared Rules

Preserve fullscreen plans close/scroll and compact currency dropdown; use shared settings header/content/row surfaces, Button and InlineMessage.

## Exceptions

Billing-specific subscription status and hosted checkout actions replace template labels without creating a new layout family.

## Evidence

Observed tests/e2e/billing.spec.ts at 390/1440px in light/dark: General/Billing header gap and standard row width/padding/border/radius/background match. Desktop dark plans and mobile light settings screenshots inspected; existing fullscreen and no-registration-footer structure retained. Hosted subscription return/pending/current-plan scenario passed.

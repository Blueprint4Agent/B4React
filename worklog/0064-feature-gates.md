# Commit Title

fix(config): hide disabled features and suppress their requests

# Changed File Scope

Public configuration, authentication and billing guards, frontend routes/hooks, contracts and tests.

# Reason

Disabled integrations must not remain visible or issue provider requests. Verify Stripe startup failure blocks serving.

# Design

Expose effective billing flags in public config; use existing config owner to gate routes and requests. Audit email, login and OAuth on both sides; retain typed domain errors. No schema migration.

# Verification Plan

Run make verify-plan then make verify; add disabled-feature request assertions and startup failure regressions.

# Impact

Disabled features disappear; enabled features retain current behavior. No payment or email is sent during validation.

# Loop Alignment

Request/service/error loops retained; no new background tasks or domain mutations. Frontend owner/recovery paths honor feature flags.

# State Ownership

AppConfigProvider owns server feature flags; existing billing hooks own account snapshots. A flag change invalidates hook generations. No new persistence or global store is introduced; Zustand/RTK not needed.

# Memoization

No new expensive rendering boundary is introduced. Existing component memoization remains; conditional feature gates are cheap booleans. OAuth effect uses the stable API callback and ignores obsolete responses.

# Performance Evidence

Disabled billing browser tests observe zero billing requests at 390px and 1440px, including focus/online recovery and direct routes. Disabled subscription tests retain invoice UI with zero subscription/plan requests. Existing enabled billing scenarios pass.

# Verification

Root make verify-plan / make verify selected backend=True, frontend=full and passed. Child check/test: 130 Vitest tests; test-ui: 156 Playwright tests; production routes: 9; Style Studio: 3; API contract, composition/performance policies, build and packaging passed. Targeted billing suite: 48 passed. No checks skipped. The parent delegated these exact child checks; do not repeat unchanged evidence outside mandatory hooks.

# Page Family

Existing families and components are reused; this task changes feature visibility rather than styling.

## Family

Settings, auth dialogs, main Home, and standalone pricing.

## Reference

SettingsPage General and BillingSettingsPage; HomePage; LoginPage and existing AuthPageFrame; PlansPage.

## Shared Rules

Reuse the existing shells, typography, surfaces, control spacing and responsive rules; no CSS changes or new component.

## Exceptions

None. Disabled pages reuse existing home/general settings instead of creating a new unavailable screen.

## Evidence

Billing Playwright retains existing 390/1440 light/dark layout coverage and verifies hidden navigation/direct routes at both widths. No geometry or typography changes; enabled family comparisons remain valid.

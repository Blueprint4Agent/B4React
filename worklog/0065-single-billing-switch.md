# Commit Title

refactor(config): use one billing feature switch

# Changed File Scope

Billing settings/services, public/admin contracts, environment examples, frontend gates, tests and docs.

# Reason

Use STRIPE_ENABLED as the sole payment/subscription switch and remove the separate subscription option.

# Design

Remove duplicate configuration and contract fields; all billing and plan paths use billing_enabled. Enabled startup validates all subscription prices. Remove duplicate admin row.

# Verification Plan

Run root make verify-plan and make verify, enabled startup/disabled requests and admin UI regressions.

# Impact

Stripe true requires complete plan configuration. Stripe false disables all billing. Existing subscriptions are not cancelled.

# Loop Alignment

Existing request/error and frontend recovery/owner loops retained. No new background or domain event operation.

# State Ownership

Existing AppConfigProvider owns billing_enabled. Billing hooks retain local owner-scoped snapshots and recovery guards; no new store or persistence.

# Memoization

No expensive new component boundary: boolean gates and one removed admin row. Existing memoization retained; no blanket wrappers.

# Performance Evidence

Existing enabled and disabled billing browser request assertions now use only billing_enabled. Disabled requests remain zero; full verification passed.

# Verification

Root make verify-plan / make verify: backend=True, frontend=full. Child check/test passed (130 Vitest), 155 UI browser tests, 9 production-route tests and 3 Style Studio tests passed. Contracts, typecheck, format, policy checks, build and packaging passed. No checks skipped.

# Page Family

Existing page families; no new shared component or styling.

## Family

Settings, home, pricing and admin settings.

## Reference

BillingSettingsPage/SettingsPage, HomePage, PlansPage and AdminServerPage.

## Shared Rules

Retain all shells, spacing, typography, surfaces and responsive rules. Remove only duplicate subscription configuration row.

## Exceptions

None; a single billing flag controls all related pages.

## Evidence

Existing mobile/desktop light/dark browser comparisons cover these peers; new behavior retains disabled request assertions. 155 UI browser tests passed, including admin layout comparisons at 390/1440 in light/dark and disabled request assertions.

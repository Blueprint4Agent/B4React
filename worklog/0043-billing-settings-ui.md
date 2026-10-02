# Commit Title

feat(billing): add settings and plan selection screens

# Changed File Scope

Billing settings and plan selection pages, profile/sidebar navigation, billing state hook, translations, styling, tests and bilingual guides.

# Reason

Expose the existing Stripe card/Link registration flow and introduce Free, monthly and annual plan selection using the supplied layout references.

# Design

Settings owns a billing page and page-owned domain hook over existing typed API adapters. A lazy plans route offers three options and links paid selections to card registration. Example template prices: Free, monthly KRW 3,990 / USD 3.99, annual KRW 39,900 / USD 39.99. Currency is a display-only URL preference, not FX conversion. No subscription, invoice, cancellation or entitlement API exists; present these as unavailable rather than fabricate paid state. Reuse shared buttons/cards/messages. Verify hosted return parameters with the provider-backed status endpoint. Owner changes and unmount invalidate pending work; desktop recovery and browser focus/online refresh data. Deduplicate actions and retain a retry UUID within the active owner session.

# Verification Plan

Focused hook/page integration tests for loading, provider errors, disabled state, ownership, retry and return handling; browser mobile/desktop light/dark navigation and registration flow. Run make verify-plan and make verify, governance and PR checks. Parent validates pinned contracts and packaging after child merge.

# Impact

New billing settings entry and profile plan link; no backend schema/API changes or real charges. Template prices are not live Stripe prices. Actual subscriptions remain pending operator configuration and backend implementation.

# Loop Alignment

API page/hook/adapter loop retained. No billing realtime events exist; refetch on return/focus/online and desktop recovery. UI composition reuses existing shared primitives and app.css. No new worker/domain event loop for frontend-only registration.

# State Ownership

Billing hook owns transient server snapshots, pagination and action state scoped to owner. Selected plan lives in URL; no global store, credential or payment state persistence. Page reset keyed by identity; stale responses cannot navigate a new owner.

# Memoization

Three small plan cards render only on URL selection/language changes; no expensive repeated computation or blanket memo needed. API methods are stable through existing useBillingApi. Callback stability applies to effect dependencies.

# Performance Evidence

Hook tests observe one initial config fetch and exactly two method-type reads; focus triggers one config refresh and disabled config suppresses provider reads. Browser tests assert zero billing config calls while browsing plan prices. Production tests confirm PlansPage is deferred until navigation and currency survives reload. No latency improvement claim.

# Verification

make verify-plan and make verify selected full frontend checks. Verified 110 Vitest tests (8 billing hook tests), 78 browser UI scenarios (7 billing scenarios), 7 production route/branding tests and 3 style studio tests. Typecheck, format, architecture/UI composition, React performance and hooks checks passed. Screenshots inspected for desktop dark plans and mobile English/Korean billing; final screenshots wait for the existing entry animation to finish. Registration navigation uses mocked HTTPS Stripe pages, not real Stripe resources. No selected checks omitted; real card entry, live subscriptions and native external-browser return were not exercised because no production purchase is part of this UI task.

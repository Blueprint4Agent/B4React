# Commit Title

feat(billing): add tier pricing and profile badges

# Changed File Scope

Billing models, pricing configuration/service, local OpenAPI contract, pricing/settings/sidebar UI, tests and bilingual billing documentation.

# Reason

Separate Free/Plus/Pro product tiers from monthly/annual billing and show the server-confirmed tier on the sidebar profile.

# Design

Preserve legacy monthly/annual price IDs as Plus, add Pro purchase keys while mapping tier and interval independently in the UI. Server owns amounts and subscription identity. Pricing reuses the standalone plans family and shared SegmentedControl; profile badge reuses avatar composition. Each paid card owns its interval selector. Annual prices use roughly 10 percent discount; existing subscribed prices are preserved. Plus-to-Pro upgrades use immediate prorated pending updates; downgrades/cancellation and same-tier cycle changes remain period-end. Pending payments retain the old tier and show an explicit recovery action.

# Verification Plan

Run make verify-plan then make verify in child and parent; provider-mocked tier/interval and ownership tests; desktop/mobile pricing and sidebar UI comparisons.

# Impact

Existing Plus subscriptions retain their provider price IDs and billing schedule. No automatic migration or charge. New Pro purchases require configured provider prices.

# Loop Alignment

Existing typed API hook ownership and async account/request guards remain. Route-shell ownership respects component/domain boundaries. Mutation invalidation and focus/online/desktop recovery refetch Stripe snapshots; no billing SSE exists. Shared SegmentedControl/Modal/Button/InlineMessage composition retained. Background/webhook entitlement loops are not added because this task changes provider-backed subscription selection and display.

# State Ownership

The route shell owns the sidebar subscription snapshot with useSubscription and passes the tier through AppLayout/AppSidebar props; visual components make no domain API calls. URL keys plus_interval/pro_interval own independent preview periods and currency owns the shared preview. Server snapshots reset on owner changes and recover on focus/online/desktop reconnection. A mutation broadcasts invalidation, never a claimed entitlement, to mounted consumers. No persistent store or new provider.

# Memoization

Three small plan cards and a small profile badge do not justify memoization; retain established expensive boundaries.

# Performance Evidence

126 frontend tests passed, including a two-consumer mutation test: two initial subscription reads plus exactly one profile refresh after a successful change. Owner-switch stale responses remain covered. No latency improvement is claimed. Pricing remains a lazy route.

# Verification

make verify-plan selected frontend=full. make verify passed hooks, check/test (126 tests), browser UI (143 tests), production routes (9 tests) and Style Studio (3 tests). No frontend scopes omitted. Backend/provider verification belongs to the parent; separate sandbox success/failure probes confirmed provider behavior. The earlier mobile assertion still named an old button; it was updated to assert the correct Free current-plan action and the full UI suite passed.

# Page Family

## Family

Standalone plans and sidebar profile controls.

## Reference

PlansPage.tsx, ProfileDropdown.tsx, shared SegmentedControl and UserAvatar.

## Shared Rules

Reuse fullscreen pricing width, close action, card typography, theme tokens and responsive grid; preserve sidebar profile trigger and collapsed layout.

## Exceptions

Tier badge overlays the avatar to remain visible in collapsed sidebar; price display adds annual monthly-equivalent and total without changing the host family.

## Evidence

billing.spec.ts compared settings Billing vs General geometry at 390/1440 in light/dark; all passed. Pricing screenshots show per-card independent interval controls, provider-derived 10% savings and totals without overflow. Profile typography tests compare tier/email placement, font weight and mobile/desktop overflow in both themes. Reviewed dark mobile and light desktop profile screenshots and dark desktop annual cards; artifacts archived under /tmp/subscription-tier-review.

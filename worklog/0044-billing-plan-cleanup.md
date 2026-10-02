# Commit Title

style(billing): simplify plan selection layout

# Changed File Scope

Plan page presentation, app.css, bilingual billing guide and worklog. Parent integrates the child pin.

# Reason

Simplify the plan UI and remove the redundant back-to-billing action requested by the user.

# Design

Remove back navigation, eyebrow, redundant currency label and decorative card icon/headline. Keep plan names, descriptions, prices, selection actions. Present the template-price disclosure as quiet readable footnote text rather than an alert card. Move /plans outside AppLayout into a full-window scroll surface with a top-right accessible close action and bounded internal return destination. Signed-in Free remains the current template plan with a disabled Current plan action; URL selection cannot promote a paid candidate into the active subscription. Use the shared compact currency dropdown at the upper right of the cards and remove the registration footer from plans; registration remains in Settings Billing. No billing API changes.

# Verification Plan

Run make verify-plan and make verify, existing browser layout/registration tests and visual screenshot review. Parent validates packaging/contracts after child merge.

# Impact

Cleaner plan comparison with less repeated copy. Example-price and no-subscription disclosures remain visible.

# Loop Alignment

UI composition retains shared Button/DropdownMenu and app.css. API, realtime and desktop recovery behavior is unchanged; no backend/event/task changes.

# State Ownership

Unchanged: URL owns selected plan/currency, domain hook owns billing data.

# Memoization

No expensive computation or new render boundary; small cards still update on selection/currency/language.

# Performance Evidence

Presentation-only removal; existing request-count and lazy route tests remain applicable. No performance claim.

# Verification

make verify-plan selected full frontend scope; make verify passed hooks, check/test (110 tests), browser UI (79 scenarios), production routes (7), and style studio (3). Desktop dark and mobile light screenshots reviewed. Current-plan disabled state, currency changes, absent registration footer and close navigation are covered. Backend/provider writes and native packaging omitted: no backend changes or real Stripe operations in this presentation task.

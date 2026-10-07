# Commit Title

fix(ui): contain billing errors and show admin loading spinners

# Changed File Scope

BillingSettingsPage, AdminPage, AdminUserTable, app.css, page-family notes and browser coverage.

# Reason

Keep section failures inside their billing surfaces and maintain stable minimum heights; show administrator loading with spinners.

# Design

Reuse StatusCard, Spinner and settings-row. Keep section-specific retry handlers and independent results. Preserve existing request ownership and admin table memoization.

# Verification Plan

Run Make scoped verification and browser checks for error containment, minimum heights, retries and admin loading. Compare Billing with General at desktop/mobile in both themes.

# Impact

Presentation only; no API or database changes.

# Loop Alignment

Existing API hooks and retries remain unchanged. No realtime or desktop recovery changes; shared composition reused.

# State Ownership

Existing billing/admin hooks own remote state; no new state store or persistence.

# Memoization

Retain memoized AdminUserTable. Static presentation branches require no new memo boundary.

# Performance Evidence

All 140 tests passed, including memoized admin date-format isolation and subscription request regression coverage. No latency improvement claimed.

# Verification

make verify-plan selected frontend=ui. make verify passed check/test (140 tests), test-ui (164 tests), and production build. Backend, route-recovery and style-studio suites were omitted by the classifier because this is presentation-only. Initial geometry checks exposed a subpixel height threshold and an unrelated transient animated menu measurement; after allowing 0.5px height tolerance all UI tests passed.

# Page Family

## Family

Settings and administrator collections.

## Reference

SettingsPage General settings-row and existing AdminServerPage Spinner.

## Shared Rules

Preserve shared shell, surface tokens, spacing, typography and buttons.

## Exceptions

Billing section minimum heights reserve space for independent loading/error states. Admin loading stays within the existing collection region.

## Evidence

billing.spec.ts verified General/Billing shared surface geometry and error containment at 390/1440px in light/dark themes; screenshots recorded under test-results/billing-billing-isolates-\*/billing-error.png, including a visually inspected desktop dark error state. All admin-panel browser tests passed; AdminPage component coverage verifies the busy region and spinner replacement with loading data.

Pre-push exposed a repeated pre-existing menu geometry race: three browser calls sampled different animation frames. The test now reads row/icon/label rectangles atomically without weakening its geometry assertions.

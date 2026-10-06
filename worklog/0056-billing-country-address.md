# Commit Title

fix(billing): refine address fields and section actions

# Changed File Scope

Billing profile dialog, lazy Stripe address form, page wiring, shared text Button and StatusCard action, showcase, focused browser/component tests and localized billing documentation.

# Reason

The existing dialog treats every city/state as free text regardless of the selected country. The user also requested clearer placement of errors/retry and lightweight actions attached to their sections.

# Design

Reuse Stripe AddressElement in billing mode for country-specific address structure and regional selectors. Keep the existing compact Modal, email input and save action. Use the configured public key, lazy-load the address form, validate complete values before the existing onSave callback, and preserve manual entry when no public key is configured. Do not require a payment SetupIntent or Google Maps autocomplete for profile edits. Group page error and retry inside one StatusCard above the current plan. Reuse a text Button variant beside section headings and for receipts, and demonstrate normal/loading/disabled states plus StatusCard retry in the showcase.

# Verification Plan

Component tests for loading/incomplete/complete/error and save guarding; existing billing browser tests for manual fallback; actual provider UI inspection for Korea, US and Japan; mobile/desktop light/dark peer checks. Run make verify-plan then make verify before commit.

# Impact

Structured profile API remains unchanged. Address fields follow provider country formats. No additional dependencies or backend changes.

# Loop Alignment

Page continues owning billing mutation hook, while the form owns draft/validation. No new SSE events. Existing busy/offline and recovery behavior remains. Reuse Modal/InputField/ModalButton and Stripe hosted address controls.

# State Ownership

Draft email and fallback address stay local to the dialog; Stripe owns its address draft. The validated snapshot is sent through the existing page callback. No persistent store or extra domain requests. Page errors remain deduplicated by the existing owners; StatusCard action and text Button are presentation only.

# Memoization

No repeated expensive child boundary introduced; stabilize Stripe client and initial options to avoid resetting provider fields. Memoize fallback country labels by locale so provider input events do not rebuild all country labels. Context/input updates must remain visible.

# Performance Evidence

Production build emits a separate BillingAddressFields chunk; Stripe fields load only after opening a configured profile editor. Component regression confirms one save for repeated submits and no save for incomplete/not-ready fields. Fallback country labels are memoized by locale. No user-visible latency improvement is claimed.

# Verification

`make verify-plan` selects UI scope. Final `make verify` passed 122 unit/component/integration tests and 112 browser cases; production build reused an unchanged matching receipt after the final modal-feedback composition change. Actual Stripe country-field review and four intercepted profile saves passed; native desktop and real provider profile mutations were not exercised. Production route recovery/style-studio browser suites are omitted by the UI classifier because routing/configuration/tooling are unchanged. A Git-alias verification attempt leaked repository environment into isolated fixture tests; restored local core.bare and removed fixture author settings, verified unchanged HEAD/index, and resumed direct Make validation with a clean repository environment.

# Page Family

## Family

Compact billing modal and Settings section actions/feedback.

## Reference

BillingCardDialog.tsx, existing BillingProfileDialog.tsx, General settings rows, existing StatusCard and Button showcase.

## Shared Rules

Reuse Modal shell/footer, InputField, ModalButton, InlineMessage and existing form gap. Stripe appearance derives from host tokens.

## Exceptions

Provider-hosted address fields adapt to country-specific formats; the modal shell remains native. Text actions sit beside their section heading instead of opposite it; page-wide error/retry appears before the current-plan section.

## Evidence

Actual Stripe fields: 12 KR/US/JP combinations at 390/1440px in light/dark plus four mocked profile saves passed; artifacts in /tmp/billing-country-review/. Visually checked Korean mobile dark and US desktop light. Existing compact modal geometry is retained and host tokens match the native email field. Targeted browser coverage passed 10 cases for error placement, retry containment, heading/action proximity, text-button hover/focus and showcase states. Screenshots are in test-results/_text-sect_/ and test-results/_deduplicat_/.

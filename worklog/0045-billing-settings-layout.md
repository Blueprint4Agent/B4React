# Commit Title

fix(billing): align billing with shared settings layout

# Changed File Scope

Billing settings composition, app.css, billing browser coverage and bilingual guides.

# Reason

Billing duplicated header spacing and introduced independent oversized panels instead of following existing settings layout rules.

# Design

Place the shared header beside the content container, reuse settings-general-content and settings-row surfaces, and keep only billing-specific layout rules. Match spacing and typography to existing settings. Add browser comparison against General settings geometry and surface styling.

# Verification Plan

make verify-plan then make verify; browser comparisons at mobile/desktop in light/dark, screenshot inspection and existing registration regressions.

# Impact

Consistent settings density without changing billing actions, state or APIs.

# Loop Alignment

UI composition reuses existing shared settings classes and Button. API state/realtime/desktop recovery are unchanged; no new loop or backend work applies.

# State Ownership

Existing useBilling owns data; no new state.

# Memoization

Presentation-only composition; no expensive new boundary warrants memo.

# Performance Evidence

Existing request-count tests remain applicable; no performance claim. Browser geometry will compare actual settings sections.

# Verification

make verify-plan selected UI scope; make verify passed check/test (110), browser UI (79) and build. Existing four mobile/desktop light/dark cases compare General and Billing header gap, row width, padding, radius, border and background; all passed. Desktop dark and mobile light screenshots inspected. Route/style-studio/provider/native checks omitted by scope: no routing, shared-control protocol, provider or native change. Parent integration retains its full branch checks.

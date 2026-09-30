# Commit Title

fix(api-key): keep expiry dropdown outside modal scrolling

# Changed File Scope

Shared DropdownMenu and Modal focus handling, API-key creation warning, locales, CSS, browser tests and synchronized frontend guides.

# Reason

Opening expiry options increases modal-body scrollHeight from 140 to 282px while clientHeight remains 140px, clipping the menu. Non-expiring API keys also need an explicit warning.

# Design

Portal modal dropdowns to the enclosing dialog outside the clipped panel/body. Measure trigger-relative fixed geometry, flip/clamp within the viewport and bound menu scrolling. Preserve ordinary inline dropdowns and scoped theme inheritance. Include portal controls in modal focus containment; dismiss dropdown before modal on Escape. Reuse InlineMessage warning only for never expiry.

# Verification Plan

Run make verify-plan and make verify. Browser checks at mobile/desktop and short heights verify unchanged modal scroll geometry, menu hit-testing, placement, selection, warning appearance/removal, outside click, Escape and focus. Preserve production/style-studio coverage selected for new locale keys.

# Impact

Shared modal dropdown behavior is corrected without changing API payloads, key lifetime choices or modal body overflow rules.

# Loop Alignment

UI composition extends shared DropdownMenu/Modal and reuses InlineMessage. API state remains page-owned; no transport change. Realtime and desktop recovery are not applicable to local menu geometry/warnings.

# State Ownership

Open state and DOM geometry remain local to DropdownMenu. Expiry selection remains controlled by SettingsPage; the warning is derived, with no duplicate state or new store.

# Memoization

No expensive new subtree or computation; four menu rows and one warning do not benefit from a memo boundary. Effects only run while a modal menu is open and clean up observers/listeners.

# Performance Evidence

Observed before/after opening the fixed dropdown: modal body clientHeight 140px and scrollHeight 140px both times (previously scrollHeight grew to 282px). No latency claim.

# Verification

Full make verify passed: check/test, 71 browser UI cases, six production build/route cases and three style-studio cases. Added focus regression separately: make test passed all 98 tests. Browser coverage verifies unchanged scroll geometry, hit-tested options, trigger width/gap, finite/no-expiry warning transitions, short-viewport upward placement, outside click and Escape focus recovery. Korean dark-theme screenshots visually reviewed. No selected frontend checks omitted; backend checks not applicable.

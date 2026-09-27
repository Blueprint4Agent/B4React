# Commit Title

style(ui): compact API key management and typography

# Changed File Scope

DeveloperApiKeysSection, shared Modal compact variant, CSS tokens/typography,
locales, API-key component/browser cases and bilingual guides.

# Reason

API-key creation and records need a compact, aligned, readable presentation; shared
controls/text are oversized and overly bold.

# Design

Replace stacked key cards with a semantic, horizontally contained table showing
name/prefix, state, usage, expiry and actions. Preserve all metadata, six-row
pagination slots, status toggles, delete confirmation and one-time secret behavior.
Use existing Button/Tooltip/ToggleSwitch/StatusBadge. Add a compact Modal variant
for API-key flows. Lower desktop controls to 36px, button/menu text to 13px and
regular body weight to 400; use theme-aware status colors for readable system-dark badges; preserve 44px coarse-pointer controls and focus rings.

# Verification Plan

Run child check/test/build/test-ui and parent frontend-format-check/frontend-test.
Verify seeded key table/status/actions, creation modal bounds, mobile scrolling,
and existing create/reveal/toggle/delete/pagination behavior.

# Impact

Presentation only; existing API/hook/realtime contracts and mutation guards remain.

# Loop Alignment

UI composition uses shared primitives. Settings keeps domain hook ownership and
passes controller props; API/realtime/recovery loops remain unchanged.

# Verification

Passed child make check/test/build (52 tests), test-ui (21 browser cases), and
root frontend-format-check/frontend-test. New browser cases seed active/inactive/
expired rows at 320px/1440px and verify table containment and creation bounds.
Existing scenarios pass create/reveal/toggle/delete and stable six-row pagination.
Reviewed light/dark 390px/1440px table/modal screenshots; corrected system-dark
badge contrast using shared theme tokens. No required checks skipped.

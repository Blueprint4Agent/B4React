# Commit Title

fix(ui): improve contrast and share selection cards

# Changed File Scope

Shared app.css, SelectionCard, catalogue/locales, browser contrast regressions, bilingual engineering guides and consuming gitlink.

# Reason

Neutral/danger controls inherit the primary hover background while retaining incompatible text. Light category selection is weak, and sidebar/main surfaces are identical.

# Design

Keep shared controls and CSS ownership. Give neutral/danger actions their own hover colors; skip disabled hover styling. Use a selected category foreground/background pair, stronger light card boundaries, and a theme-specific sidebar surface consistent between expanded/collapsed modes. Use a shared sidebar CSS token; keep the studio preview scoped to the catalogue. Keep explicit and system dark declarations aligned. User additionally requested the category control as a shared selectable-card showcase: add controlled SelectionCard, reuse it in category navigation, and demonstrate selectable/disabled states.

# Verification Plan

Root frontend-format-check/frontend-test; child make check/test/build/test-ui/test-style-studio. Browser-computed text contrast at hover and surface distinction in light/dark, mobile/desktop; render screenshots for inspection. Stage and validate governance before each commit.

# Impact

Visual defaults and a reusable controlled SelectionCard; no API or navigation change. Sample selection stays local to the showcase. Existing studio overrides remain user-controlled.

# Loop Alignment

UI composition uses shared CSS and existing buttons. API state, realtime and desktop recovery logic are unchanged; no backend request/event/background work is needed for this visual change.

# State Ownership

SelectionCard is controlled by selected/onClick. The showcase owns one local sample selection; category filtering keeps its existing collection hook. No stores/providers; existing theme/studio ownership retained.

# Memoization

SelectionCard is a trivial native-button wrapper whose selected props change on interaction. No expensive subtree or measured redundant work justifies a memo wrapper; existing protected memo boundaries are untouched.

# Performance Evidence

No performance claim. Browser tests verify enabled button text contrast >= 4.5:1 in explicit/system light/dark, disabled hover stability, native keyboard selection and existing geometry. Admin render isolation tests remain passing.

# Verification

make check, make test (85 tests), make build, make test-ui (60 cases) and make test-style-studio (3 cases) passed. Root frontend-format-check/frontend-test also passed. Inspected light surfaces, dark modal cancel-hover and mobile/desktop SelectionCard screenshots. No checks skipped; existing API/realtime/recovery loops remain unchanged.

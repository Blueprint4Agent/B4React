# Commit Title

feat(sidebar): add project repository and documentation links

# Changed File Scope

AppSidebar, shared CSS, English/Korean locales, frontend guides and browser layout coverage.

# Reason

Make project source and documentation accessible immediately above the footer profile button.

# Design

Compose two native external anchors with existing sidebar row styles and Tooltip. Open the B4FastAPI repository and https://blueprint4agent.github.io/docs in a new tab with noopener/noreferrer. Reuse the existing official GitHub SVG as a currentColor CSS mask. Use User guide / 사용 가이드 labels. Keep links available in the shared settings/admin shell and collapsed rail.

# Verification Plan

Run make verify-plan and make verify, including browser checks at mobile/desktop widths. Validate staged Git governance and ready PR metadata.

# Impact

Adds two footer links without API, routing, dependency or persisted data changes.

# Loop Alignment

UI composition reuses sidebar rows and Tooltip. API state, realtime and desktop recovery are not applicable: static external navigation has no server state; existing connectivity/profile controls remain owned by their current providers.

# State Ownership

No new state. Sidebar expansion remains owned by AppLayout; locale by i18n.

# Memoization

No new memo boundary: two trivial anchors do not involve expensive computation or repeated domain rows.

# Performance Evidence

No optimization claim. Production build/routes and 71 browser UI tests passed; anchors introduce no API requests before activation.

# Verification

make verify-plan selected full frontend verification because locale keys were added. make verify passed: check/test (97 tests), test-ui (71), production build/routes (6), and style studio (3). Initial pre-final run hit one recovery-test timeout; the complete final run passed without test changes. No selected frontend checks omitted; backend checks are not applicable to standalone static links. Docs URL returned HTTP 200. Browser geometry checks cover 375/1440px, collapsed/expanded links, accessible names, safe new-tab attributes and footer ordering.

# Commit Title

feat(home): refine landing navigation and sections

# Changed File Scope

ProjectOverview, home account composition, scoped styles, EN/KO content and guides, browser coverage and this worklog.

# Reason

Refine the landing from the supplied references: persistent capsule section navigation, image-only preview framing, top icon-pill source links, feature cards, development steps, use cases and a grouped footer. Remove home-only coffee support. Add timed preview rotation, stronger section labels and flat header links in topnav; preserve the existing navbar GitHub.

# Design

Keep the selected service shell and theme tokens. Use native section anchors with smooth scrolling and reduced-motion fallback, fixed at the desktop header center, sticky below the mobile header, with target offsets. Header modes use plain text links centered inside the actual header; only sidebar retains a capsule. Footer fills the full main width and constrains only its inner content. Keep actual auth-gated destinations and demo previews. Use real repository/guide links; no invented legal pages, metrics or customer claims. Development steps reflect clone/configure, build features, verify/deploy; use cases describe possible applications rather than deployed customers.

# Verification Plan

Run make verify-plan and make verify. Browser-check sticky navigation and target visibility across three layouts, mobile/desktop, light/dark and reduced motion. Check keyboard links, preview modal, footer permissions and unchanged static introduction.

# Impact

Home composition changes only. Global coffee links remain development-only. No new API, dependencies, data persistence or deployment variables.

# Loop Alignment

UI composition uses existing tokens and Button/Modal. API, realtime and desktop recovery owners remain unchanged; no new request/event/background loops are needed.

# Verification

make verify-plan selected full frontend verification. make verify passed hooks (6.4s), check (23.3s), 195 unit/component tests (4.1s), 240 browser cases (78.6s), production routes and static discovery (13.6s: 10 route cases, 11 discovery cases), and Style Studio (5.8s: 3 cases). Backend checks are not applicable to this independent frontend. No selected checks were omitted. Initial regression runs exposed overlay stacking and a border-box geometry expectation; both were corrected before the final passing run.

# State Ownership

Existing preview/modal state remains local. Native anchors and fixed/sticky CSS own scrolling without a global store or per-frame React state. Preview rotation uses one cleaned-up six-second timeout and local visibility, motion and user-pause state. IntersectionObserver and document/motion listeners stop rotation when hidden, offscreen, reduced-motion or while enlarged. Hover and focus do not interrupt rotation. Four mounted images crossfade with CSS opacity; reduced motion removes transitions. CSS progress runs with the same pause state without per-frame React renders.

# Memoization

Static navigation and content have no expensive stable-prop boundary; do not add blanket memo wrappers. Existing preview state updates remain necessary.

# Performance Evidence

Browser inspection confirmed all four local images decoded before switching; at 100ms into a manual switch, old/new opacity was 0.414/0.586. While hovered, CSS progress advanced from 0.174 to 0.424 over 1.5 seconds. No per-frame React state, new API reads, dependency or route boundary is introduced. Four existing demo images load eagerly to avoid source-swap flashes.

# Page Family

## Family

Existing Home landing family within the persistent app shell.

## Reference

ProjectOverview hero and public introduction typography; existing shared pill Button and neutral panel surfaces.

## Shared Rules

Preserve existing home width, theme typography, auth/role filtering and global shell. Use token-based borders, surfaces and focus treatment.

## Exceptions

Home preview puts its border on the image instead of a browser-chrome card; static /about retains its existing frame. User explicitly requests feature cards, numbered steps, use cases and grouped footer in place of the prior plain groups.

## Evidence

Reviewed actual desktop dark and mobile light Home screenshots against the existing Home/public-introduction typography and shared controls. Minimal header center deltas were x=0/y=0 with transparent background. Browser coverage checks all three shells at 390/1440px in light/dark, native keyboard anchors, unobscured targets and full-width footer; static introduction retains its frame.

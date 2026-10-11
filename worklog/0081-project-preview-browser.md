# Commit Title

feat(home): add a focused project preview browser

# Changed File Scope

ProjectOverview, scoped styles, locales, screenshot assets, optional support URL validation/environment example, home docs and unit/browser tests.

# Reason

Make project screenshots easier to explore, give both hero actions consistent shared Button styling, and correct all visible home service labels to shared nav.brand (B4A).

# Design

Retain the home/settings shell. Show actual demo user directory, server status, billing and showcase screenshots; add thumbnails, explanations, a shared Modal viewer and role-aware destinations. Cover billing, cache/realtime, email, object storage and operations in the capability list. Smooth-scroll hero actions honor reduced motion. Use Button for both hero actions. Optional Buy Me a Coffee uses public build-time enabled/URL variables, strict creator-URL validation and development-only server mode gating; no third-party embeds. No new shared UI exports.

# Verification Plan

Root make verify-plan and make verify; inspect mobile/desktop light/dark. Test thumbnail selection, enlarged image loading, Escape/focus restoration, feature links, action geometry and production restrictions.

# Impact

Frontend-only exploration; static screenshots do not expose live account data. Production still hides developer-only navigation.

# Loop Alignment

Use existing Button, Modal and navigation. Auth/config owners remain unchanged. No new API, realtime or connectivity loops.

# State Ownership

Selected preview and viewer visibility are local state; config/locale remain provider-owned. No store or persistence.

# Memoization

Four static previews and cheap descriptions have no frequent updates or costly repeated children; memoization would not avoid useful work. Modal and selection updates are intentional.

# Performance Evidence

Eight locale-specific WebP assets total 257,122 bytes. HomePage production chunk is 10.51 kB (3.32 kB gzip). Preview selection and support configuration add no API requests; no latency improvement claimed.

# Verification

make verify-plan selected full frontend scope. make verify passed: hooks/check, 164 unit/component/integration tests, 191 browser tests, 10 production route tests and 3 style-studio tests. All selected checks ran. Initial new browser geometry measurement raced the return navigation; waiting for account links fixed the test synchronization. Final browser coverage verifies four images, modal decoding/Escape/focus, equal hero button geometry, scroll destination, role-aware destinations, zero public-preview admin requests and enabled support in development but no support DOM in production.

# Page Family

## Family

Existing home/settings shell and shared Modal.

## Reference

ProjectOverview, MainPageTemplate, General settings and Modal.

## Shared Rules

Keep shell geometry and tokens; use shared Button for hero and gallery actions, Modal for focus/scroll handling.

## Exceptions

Wide image viewer and thumbnail geometry are scoped to static project screenshots.

## Evidence

Home/General geometry comparisons passed at 390/1440px in light/dark, along with viewer overflow and focus restoration checks. Inspected /tmp/b4-gallery-ko.png, /tmp/b4-gallery-modal-ko.png and /tmp/b4-home-mobile-ko.png. Captured admin users/server/billing images were visually checked, including valid dates and fictional account/card data. Shared buttons match height/background/radius.

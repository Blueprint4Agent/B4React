# Commit Title

feat(home): redesign the home as a product landing page

# Changed File Scope

HomePage, ProjectOverview, shared stylesheet scoped home rules, EN/KO copy/docs and browser coverage; parent owns only gitlink and integration docs.

# Reason

Replace the settings-like first screen with a restrained product landing page, using the referenced dailoom.co hierarchy as inspiration rather than copying its appearance or content.

# Design

Keep the selected app shell and all role/auth gates. Introduce a documented home-landing family with a wider two-column introduction and actual product preview, compact text preview navigation, grouped unboxed capability lists, an honest source/documentation starting point and compact account links. Reuse Button, Modal, existing product screenshots and theme tokens. Preserve public discovery output and standalone page families. No backend contract or new data request.

# Verification Plan

Run make verify-plan / make verify and browser comparisons at desktop/mobile, EN/KO, light/dark and all three service layouts. Preserve preview selection, modal keyboard behavior, roles, guest login, production route loading and static introduction checks.

# Impact

Home presentation/copy changes; account destinations, previews, auth overlays, layout defaults and deployment options remain available. No invented usage metrics, testimonials or provider readiness claims.

# Loop Alignment

UI composition follows existing Button/Modal and theme tokens. API/auth/realtime state remains in existing owners; no new API calls/events/tasks. Desktop recovery remains in the app shell; backend lifecycle/event/background loops are not applicable.

# State Ownership

Preview selection and modal visibility stay local to ProjectOverview. Home consumes existing auth/config snapshots for destinations. No global store or new provider.

# Memoization

The small home presentation is not an expensive stable-prop boundary; preview changes must update its image/caption. Preserve protected admin memoization and lazy route boundaries; no blanket memo wrappers.

# Performance Evidence

Public-preview browser coverage confirms no administrator API reads. Only the active image renders in the preview selector (four duplicate thumbnail images removed); no new dependencies or media. Preview selection and modal state remain local. Production entry is 509.72 kB (gzip 158.86), stylesheet 135.48 kB (gzip 23.57); no latency improvement is claimed.

# Verification

make verify-plan selected frontend=full, backend=False. make verify passed: 195 unit/component/integration tests, 227 UI browser cases, 10 production-route cases, 11 static-discovery cases and 3 style-studio cases, plus hook/policy/type/format checks. A focused 33-case runtime/layout pass also succeeded. Updated legacy assertions that treated Home as a Settings card or prohibited all source links; production still hides developer shell links while the landing source link is intentional. Backend/native checks were not selected because neither implementation changed. UI composition, auth/API state, realtime and desktop recovery ownership remain intact. Logs: /tmp/b4-home-verify.log and .git verification-logs; visual artifacts: /tmp/b4-home-review and /tmp/b4-home-*-dark.png.

# Page Family

## Family

New Home landing family inside the persistent app shell; existing settings, profile, auth and public discovery remain their own families.

## Reference

Existing ProjectOverview product previews and public-discovery surfaces; MainPageTemplate remains the canonical settings-style menu template for other consumers. The dailoom.co reference informs first-screen hierarchy only.

## Shared Rules

Retain global colors, typography family, shared button/modal/focus behavior, screenshot surfaces, resource links and responsive app navigation. Reuse existing source screenshots and translated copy keys where applicable.

## Exceptions

Home intentionally uses a wider introduction and does not inherit settings header/card geometry. Account links become a compact footer-region navigation. Register this family in both page-family guides before reuse.

## Evidence

Reviewed /tmp/b4-home-review screenshots for 390/1440px EN light/dark and Korean long account names, and Korean topnav/minimal first screens. Additional /tmp/b4-home-{sidebar,topnav,focused}-{dark,footer}.png captures show the dark hero, source/guide region and guest shortcuts. Wide hero/preview columns become stacked on mobile, feature lists stay unboxed, and global shell geometry is retained. Runtime browser checks compare inherited text/font with General; administrator geometry continues to compare against General because Home intentionally has a distinct family. Public discovery retains separate hero/screenshot surface comparisons.

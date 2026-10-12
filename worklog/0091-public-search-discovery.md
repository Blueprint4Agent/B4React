# Commit Title

feat(discovery): add crawlable bilingual project introduction

# Changed File Scope

Public discovery build assets, English/Korean content and documentation, crawler policy, build configuration and regression coverage.

# Reason

Expose an accurate B4A introduction without JavaScript or authentication while retaining the existing application home and account flows.

# Design

Opt-in public discovery build generates /about/ and /about/ko/ with canonical/hreflang, shared home styling and localized feature copy. Only these public pages enter the sitemap. Search crawlers are allowed; OpenAI/Anthropic training bots are blocked. App HTML is noindex when discovery is enabled. Require a configured public origin and default template identity; custom projects cannot accidentally advertise B4A. No API or database changes. Parent adds build-argument plumbing, publication runbook and changed-URL IndexNow tooling.

# Verification Plan

Run root Make verify-plan and verify at the full branch scope. Add static HTML, crawler/sitemap/escaping/custom-brand guard and JavaScript-disabled browser checks; compare home typography/surfaces at desktop/mobile and light/dark. Verify packaged FastAPI static responses before claiming rollout readiness.

# Impact

Opt-in build-time behavior, no migration. Existing app routes remain unchanged. Live search registration, DNS ownership and remote deployment require actual account/server access; never claim them from local builds. Community copy is prepared for review, not posted.

# Loop Alignment

No new API requests, domain events or background tasks. Existing auth/config/realtime/connectivity owners remain unchanged. Static introduction reuses home CSS, semantic links and localized copy. IndexNow is deployment tooling rather than request-handler work.

# Verification

`make verify-plan` selected full frontend verification (Vite/build/shared CSS/new locale keys); `make verify` passed hooks, static/type/format/policy checks, 168 unit/component/integration tests, 214 browser UI tests, 10 production route/branding tests, 11 public discovery tests and style-studio checks. No checks were manually downgraded. Backend/API/DB checks are not applicable in this independent child; the parent owns packaging and static serving. Node discovery fixtures passed opt-in/origin/custom-brand/key and language/sitemap/content-hash checks. Actual running Vite cwd was confirmed as this checkout; HTTP 200 Korean HTML and noindex headers at localhost:5173/about/ko/ were verified and opened in Chrome. Existing app home remains available. No live submission or deployment occurred.

# State Ownership

Public introduction is immutable build output. Locale is owned by distinct URLs; app preferences/auth remain in existing providers. No store, polling or persistence is added.

# Memoization

Static HTML has no React renders. The additional home footer link is trivial and uses the existing locale context, so no memo wrapper is justified.

# Performance Evidence

No-JavaScript browser tests passed for both languages with zero application JavaScript/config/private API requests. Normal development and production route suites passed. The only static-page script follows system theme and does not fetch data. No latency improvement claim.

# Page Family

## Family

Public project introduction derived from the home overview.

## Reference

src/pages/main/ProjectOverview.tsx, HomePage.tsx and existing home hero/preview/capability styles.

## Shared Rules

Reuse home typography, spacing, surfaces and screenshot treatment with a 50rem content column and responsive wrapping. Text navigation uses semantic anchors.

## Exceptions

Static public document has no app sidebar, login state or interactive carousel; all content and navigation work without JavaScript. Its dedicated wrapper owns document scrolling and outer spacing only.

## Evidence

tests/discovery/public.spec.ts compared actual hero font size/weight/line height and preview border/radius/background with /home at 390px and 1440px in light/dark for English/Korean. All eight comparisons and overflow checks passed. Inspected test-results/public-ko-shares-home-surfaces-at-390-dark/public-introduction.png. Two no-JavaScript language tests passed. The initial mobile pre overflow was corrected with a document-scoped min-width rule. Normal development-server tests now cover both language URLs without a separate build/port.

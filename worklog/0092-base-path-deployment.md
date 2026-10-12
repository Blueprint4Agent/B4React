# Commit Title

feat(deploy): support configurable public base paths

# Changed File Scope

Deployment path utilities, routing/assets/session storage, configuration, integration tests and English/Korean deployment documentation. Parent also owns FastAPI static serving, cookies and Docker/Nginx integration.

# Reason

Allow independently deployed apps beneath configurable URL prefixes without hardcoded product names.

# Design

Default root remains compatible. Docker APP_BASE_PATH supplies frontend VITE_BASE_PATH and FastAPI root_path. Proxy strips prefix; application URLs retain it. Isolate browser storage and cookies by canonical path. Package a build-path manifest and reject runtime mismatches.

# Verification Plan

Run focused prefix/root routing, assets, OAuth URL and session isolation tests; production monolithic HTTP/browser checks behind Nginx; make verify-plan then make verify and Git governance.

# Impact

Path changes require a frontend rebuild and new login. No migrations or new external providers.

# Loop Alignment

Existing API/auth/realtime/desktop recovery owners remain intact; only URL construction and persistence namespace change. No new domain mutations/events/background tasks. UI composition stays unchanged.

# State Ownership

Build-time immutable base path; session and preferences remain owned by existing hooks/providers. No additional store.

# Memoization

No expensive component boundary or new render state; existing memoization retained.

# Performance Evidence

Production route checks passed (10 cases), unit/component/integration checks passed (171 tests). No new state subscriptions or latency claims.

# Verification

Full scope selected by make verify-plan; make verify passed: check, 171 tests, 214 UI cases, 10 production route cases, 11 static discovery cases and Style Studio checks (unchanged valid receipt reused). Real monolithic Docker images behind Nginx passed direct navigation/reload, assets, SSE and two-prefix session isolation using tests/deployment/base-path.spec.ts. External OAuth/mail/Stripe and native desktop distribution were not invoked; this change adds no provider integration or desktop packaging behavior.

# Page Family

<!-- Required for UI source/style changes. Identify the existing family before implementation;
record actual peer comparison after verification. Explain non-applicability instead of bare N/A.
Use the five level-two headings below; see notes/page-families.md. -->

## Family

Existing auth/settings/home families; URL wiring only.

## Reference

src/main.tsx, BrandMark, LoginPage and existing production route tests.

## Shared Rules

Retain all shells, typography, spacing and controls.

## Exceptions

No appearance changes; asset URLs and link destinations only.

## Evidence

214 existing UI cases passed, including mobile/desktop light/dark comparisons; production branding and 11 discovery comparisons passed. Real prefixed home/settings routes loaded and reloaded through Nginx. Appearance and CSS are unchanged.

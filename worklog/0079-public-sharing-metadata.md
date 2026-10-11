# Commit Title

feat(build): add public sharing metadata

# Changed File Scope

Project HTML builder, Vite config, branding tests, environment example, English/Korean sharing notes and README links.

# Reason

The built HTML lacks descriptive and social-sharing metadata for public presentation.

# Design

Generate escaped static description, Open Graph and Twitter tags from the existing project identity and optional build-time description/origin. Without an origin omit URL/image tags; custom projects never inherit the template image. Reject non-origin URLs. No canonical tag shared across unrelated routes.

# Verification Plan

Root make verify-plan/make verify; builder tests for default/custom identity, escaping and URL validation; production response metadata before JavaScript.

# Impact

Rebuild to change metadata; no live deployment, route-specific SEO or indexing guarantee.

# Loop Alignment

API state, realtime and desktop recovery are not applicable to static build metadata. No API contract or UI composition changes.

# State Ownership

Build configuration owns metadata; no React state/store or persistence additions.

# Memoization

No render work or component boundaries added; memoization is not applicable.

# Performance Evidence

Static HTML assertions and existing regression suites; no latency improvement claimed.

# Verification

Full make verify-plan/make verify passed: check including 6 project config tests, 147 Vitest tests, 188 browser UI tests, 10 production route tests and 3 Style Studio tests. No required suite omitted. Raw HTML metadata is checked without application JavaScript.

# Page Family

## Family

Existing public/auth/app families unchanged.

## Reference

index.html and current project branding transform.

## Shared Rules

No visible shell, spacing, typography or controls change.

## Exceptions

None.

## Evidence

Production branding assertions and 188 browser regressions passed; no visual layout implementation.

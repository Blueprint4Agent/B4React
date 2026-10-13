# Commit Title

feat(home): introduce prompt builder on public pages

# Changed File Scope

Home ProjectOverview, static About generator, EN/KO locales, discovery browser/generator coverage, bilingual usage docs and worklog. Parent pins the merged child and documents integration.

# Reason

Make the existing prompt builder discoverable from Home and About with a concise introduction and direct entry.

# Design

Reuse the home overview section heading, workflow region and resource-pill actions. Add a primary home hero link, a compact introduction before capabilities, and a footer entry. Static English/Korean About renders the same localized introduction and CTA without requiring JavaScript, preserving prefixed app URLs and opt-in discovery. No wizard logic or backend changes.

# Verification Plan

Run make verify-plan then make verify. Extend existing discovery coverage to check static/prefixed links, production guest navigation to the wizard and shared section/action geometry at 390/1440 light/dark in both languages. Inspect screenshots. Validate child/parent metadata and child-first integration.

# Impact

Adds public entry points to an existing guest-accessible route. No persistence, API, dependency or permission changes. Existing discovery opt-in and app readiness gates remain authoritative.

# Loop Alignment

UI composition applies through existing home classes and navigation. API state, realtime, desktop recovery and backend request/event/task loops are not applicable: only static copy and links change.

# Verification

make verify-plan selected frontend=full because the shared stylesheet and static generator changed. make verify passed hooks, check, 209 tests across 44 files, 250 UI cases, 15 production route cases, 11 discovery cases and style-studio checks. Static generator fixtures verify prefixed prompt URLs. Discovery browser cases follow Home and About CTAs into the real guest wizard in both languages. Initial four UI failures were stale two-hero-action expectations; scoped assertions now verify all three hero actions retain equal 44px geometry. Backend checks omitted locally: no server changes.

# State Ownership

No new state. Locale remains i18n-owned; navigation uses the existing router and base-path helpers. Existing preview state is unchanged.

# Memoization

New copy and links are trivial static render work; no expensive boundary or memo wrapper is added.

# Performance Evidence

No new requests or eager wizard import; production browser navigation confirmed the existing lazy route opens from both pages; production route coverage also passed. No latency improvement claim.

# Page Family

## Family

Home overview and public discovery.

## Reference

ProjectOverview home workflow section and resource-pill hero links; static About shares those existing classes.

## Shared Rules

Reuse content width, section heading typography, note spacing, resource pills and mobile wrapping from the existing family. Static renderer uses the same copy and classes.

## Exceptions

About uses plain anchors for no-JavaScript readability; Home uses router Links. Existing static wrapper remains independent of AppShell.

## Evidence

Observed 390/1440 light/dark EN/KO browser comparisons: Home/About pill foreground, background, border, radius, font and padding match; the new Home heading matches the existing workflow heading. No page overflow. Reviewed mobile Korean Home hero and prompt section plus English desktop About section screenshots. Artifacts captured under /tmp/b4-discovery-review; reproducible cases in tests/discovery/public.spec.ts and tests/e2e/runtime-modes.spec.ts.

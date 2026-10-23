# Commit Title

perf(verification): select page suites and separate visual matrices

# Changed File Scope

scripts/verification_scope.py and regression fixtures (mirrored independently), browser/component tests, capture helper, verification cache artifact guard, bilingual verification docs; parent gitlink integration.

# Reason

B4React #94: ordinary page edits run unrelated suites, and viewport/theme matrices repeat complete mutation flows.

# Design

Connect reviewed page/feature/hook owners to existing test files, deduplicate unions and broaden on shared/unknown/missing coverage. Keep business journeys canonical and use prepared states for visual matrices. Successful screenshots are explicit opt-in artifacts, not image assertions. Preserve behavior assertions and security/provider branches.

# Verification Plan

One original scoped UI baseline on an isolated data-attribute probe; classifier fixtures and related browser/unit suites while editing; root Make plan/verify once final; probe first/reuse/parent integration measurements; child-first ready PR, governance and merge commits.

# Impact

Verification/test ownership only; no application runtime/contract changes. Backend domain selection is a separate #152 task.

# Loop Alignment

App request/event/task and frontend API/realtime/desktop/UI composition implementations are unchanged. Tests retain recovery, persistence and geometry assertions; no runtime loop is skipped.

# State Ownership

N/A: no application state changes; browser fixtures keep per-test mock state.

# Memoization

N/A: no production render boundary changes.

# Performance Evidence

Measure actual verification wall time and counts; no application render-performance claim.

# Verification

- Original Inbox JSX data-attribute probe: 82.61 s, no reused commands; static app checks, 209 Vitest, 250 browser cases and build. Probe source was restored exactly.
- Reviewed file mappings cover home/profile/support/inbox/prompt-builder. Fixture checks verify single-owner selection, unions, shared provider/UI fallback and missing coverage. No per-JSX title registry was added for these pages.
- Focused browser development checks: 115 passed; optional Page/Locator successful captures: 2 passed; all browser files pass an extended strict TypeScript check with allowJs for existing script imports.
- Final child make verify-plan / make verify selected all areas because Makefile/browser configuration changed: 63 Python fixtures, 208 Vitest, 253 app browser, 15 production, 11 discovery, 3 editor cases passed. Runner 110.0 s (run-fwpqocio), all 9 commands fresh. No app runtime/contract edits; deployment browser requires Docker and was not executed.
- Support long mutation flows 8->2 (one per role), inbox 4->1, home business preview/navigation 4->1; visual matrices remain. Billing paid/profile mutation and retry recovery have canonical business owners while provider/geometry branches remain. Test count growth is not used as a coverage or speed claim.
- Successful images use explicit B4F_CAPTURE_VISUALS=1; 71 original capture sites were artifact-only, not image comparisons. Failure screenshots are automatic. The legacy loginEnabled invariant remains parameterized; native drag immediate/after-click assertions are retained in the combined retry test.
- Production-route receipt output binding was fixed and regression-tested, so replacing/deleting dist invalidates the proof.
- Scoped Inbox probe first run 16.21 s (static 7.3 s, 7 browser tests 4.5 s, build 3.9 s), repeat 0.45 s with all 3 commands reused. About 80% below the 82.61 s original probe. This is a local single sample, not a universal 20 s guarantee. Probe restored exactly before publication. Final review explicitly promotes the shared InboxProvider to full app depth rather than merely broad unit tests; its classification fixture and complete branch verification run before publication. Final complete branch verification passed after the shared-provider guard in 106.2 s (run-_bmrqcd6); parent integration measurement follows.

# Page Family

## Family

No production UI edits; existing page-family test owners are preserved.

## Reference

Settings General card remains the peer for support/inbox geometry.

## Shared Rules

Retain mobile/desktop, light/dark, alignment and overflow checks.

## Exceptions

No page-family rule exception; a temporary benchmark data attribute is restored before commit.

## Evidence

Actual browser assertions and verification timing recorded below.

# Commit Title

fix(verification): resolve domain scoped CSS consumers

# Changed File Scope

CSS impact resolver, classifier fixtures and English/Korean verification notes.

# Reason

Home-only footer CSS incorrectly selected all application browser cases plus editor/discovery. Roll back the abandoned footer UI and resolve CSS ownership from actual runtime consumers rather than billing/admin names alone.

# Design

Require a bounded class-anchored selector, known domain consumers and existing coverage. Compose domains; shared/global/sibling escape/unsupported syntax/unknown consumers widen. Mirror parent and child policies; retain independent child execution. No UI/runtime API change.

# Verification Plan

Test scoped Home/profile/inbox CSS, multi-domain unions, missing/shared consumers, global selectors/tokens/keyframes and unsafe selector escapes. Reproduce the original footer diff as a plan-only fixture, then run Make verify-plan/verify, branch governance and child-first PR integration. Finish docs before verification to avoid needless receipt invalidation.

# Impact

Existing UI restored. Future page-owned CSS chooses related tests; shared and unknown styles keep broad checks. No manual skip flag or receipt-policy change.

# Loop Alignment

Verification tooling only: request, domain event, background task, API state, realtime, desktop recovery and UI composition runtime loops are not changed.

# State Ownership

Not applicable: verification tooling adds no runtime state or store.

# Memoization

Not applicable: no React runtime changes.

# Performance Evidence

Original footer check previously ran 253 UI cases plus editor/discovery (91.5 s). With a temporary padding-only replay, plan selects Home-owned unit/browser/static/build checks; this is a plan comparison, not a new UI timing benchmark. The tooling task itself passed 65 harness fixtures in 9.9 s. No UI latency or token-saving claim.

# Verification

make verify-plan / make verify passed: harness-only scope, 65 fixtures, 9.9 s wall time (run-1_27yksp). No UI source or style diff remains. Regression fixtures cover actual Home/profile/inbox consumers, multi-domain unions, static/script/shared consumers, missing coverage, global selectors/tokens/keyframes, sibling escapes, rule-order uncertainty and explicit-full fallback. A temporary original footer-padding change selected home.spec.ts and its owned unit files; no whole-app UI/editor/discovery targets. The probe was restored. Existing whole-repository receipt binding remains #149.

# Page Family

## Family

Not applicable: tooling-only change; abandoned footer CSS is restored exactly.

## Reference

Existing Home landing remains unchanged.

## Shared Rules

No shell, typography, surfaces, actions or responsive rules change.

## Exceptions

None; source UI is outside this task.

## Evidence

Git diff confirms no src/styles or application TSX changes. Classifier fixtures reproduce page-owned CSS without changing the UI.

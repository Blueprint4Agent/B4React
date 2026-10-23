# Commit Title

perf(verification): synchronize provider verification planning

# Changed File Scope

scripts/verification.py and verification_areas.py synchronize optional provider-only planning; EN/KO verification docs and this worklog. Backend/contract helper implementations stay only in the provider repository; this standalone child never reads its parent.

# Reason

B4FastAPI #152: independent APIs should select real domain coverage without all backend/frontend tests; schema failures should not construct a real database.

# Design

Use static Python import consumers plus conventional domain test paths, retain smoke/OpenAPI boundaries, and broaden protected auth/DB/migration/config/dynamic/unknown changes. Allow only additive paths/operations/components with every pinned existing contract fragment unchanged. Use existing Make backend-test PYTEST_ARGS instead of another harness target. Child is independent; parent-only helper absence retains broad backend behavior.

# Verification Plan

Real Git fixture plans for stateless/new DB/old domain/shared changes and additive/breaking contracts; focused moved validation/invariant checks; final root Make checks; temporary independent GET API probe first/repeat timings with exact restoration; governance and child-first PR integration.

# Impact

No application runtime change. Provider additions need not rewrite the pinned child contract/types until a frontend consumer adopts them. Auth/ownership/data gates remain; no skip flag or time gate.

# Loop Alignment

Runtime request/event/background and frontend state/realtime/desktop/composition loops are unchanged. Domain tests retain persistence/ownership assertions; probe wiring is temporary and restored.

# State Ownership

N/A: shared verification planner only; no React runtime state change.

# Memoization

N/A: no production render boundary changes.

# Performance Evidence

Measure verification work/count/wall time; no application speed claim.

# Verification

Parent-delegated child Make verification passed all 63 Python fixtures with only the harness selected. No frontend runtime, contract snapshot, generated type, build or page-family behavior changes. Optional provider helper absence retains the existing broad backend behavior in standalone child fixture repositories. Parent full verification also passed 500 backend tests and the pinned consumer api-check; helper functions remain provider-owned. App/UI/browser suites were omitted here because their runtime/config/test content is unchanged from merged #96 and this task only synchronizes provider planning plus docs. Planned/actual governance and child-first integration follow before merge.

# Page Family

## Family

Verification planner only; no UI edits.

## Reference

Existing frontend verification planning policy.

## Shared Rules

Frontend runtime/UI behavior and page family checks remain unchanged.

## Exceptions

No page family exception.

## Evidence

Planner fixtures and parent integration validate this nonvisual synchronization.

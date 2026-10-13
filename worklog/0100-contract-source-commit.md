# Commit Title

docs(contracts): pin provider source commit

# Changed File Scope

contracts/source.json; this worklog

# Reason

Align harness references with the current implementation and make the API contract source reproducible.

# Design

Replace the mutable provider branch with the exact existing provider commit whose OpenAPI is semantically equal to the pinned consumer snapshot. No schema or generated type changes.

# Verification Plan

Run make verify-plan then make verify against the task base. Check provider/consumer JSON equality. Validate staged commit and actual PR metadata. Parent also validates integrated contracts and packaging.

# Impact

Documentation/provenance only; no runtime, schema, environment, or deployment changes.

# Loop Alignment

Request, domain event, background task, API state, realtime refresh, desktop recovery and UI composition loops are not applicable because no runtime behavior changes.

# State Ownership

Not applicable: no runtime or state ownership changes.

# Memoization

Not applicable: no rendering or component changes.

# Performance Evidence

No performance claim; schema equality and the repository harness verify unchanged behavior.

# Verification

- make verify-plan / make verify passed against starting HEAD 8572a36: full frontend scope (contract metadata is protected/unmapped).
- Passed hooks-test, check, test, test-ui, test-routes and test-style-studio.
- Provider commit 4e3ec02320ec342112ce613c03e26391a83a767f and consumer OpenAPI match as parsed JSON; byte formatting differs only.
- No backend suite: this child change contains no backend code. No additional manual visual check: no UI changes; required browser suites passed.
- Staged metadata and actual PR metadata are checked through the governance Make targets before publication/integration.

# Page Family

Not applicable: no UI source or styles change.

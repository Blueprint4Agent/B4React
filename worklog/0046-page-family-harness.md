# Commit Title

chore(ui): enforce page family review and settings structure

# Changed File Scope

UI composition and Git governance harnesses, regression fixtures, worklog template and bilingual agent/frontend guidance.

# Reason

Shared-control checks allowed page-family visual drift: Billing duplicated common header spacing and surface styles while still passing existing guards.

# Design

Require a Page Family review with Family, Reference, Shared Rules, Exceptions and Evidence in matching worklogs for UI source/style changes. Read policy and evidence from the staged/committed snapshot to preserve history. Add a static settings-header nesting guard and rejection fixtures. Document family references, scoped invariants, comparison evidence and honest automation limits.

# Verification Plan

Run acceptance/rejection fixtures through Make UI composition checks and full scoped verification. Preserve historical snapshots and non-UI changes. Existing General/Billing browser comparisons remain the visual gate.

# Impact

Future sessions must choose a family and record actual comparisons before UI commits. Local checks reject missing evidence and the known header nesting regression, without claiming to judge all visual similarity.

# Loop Alignment

Strengthens UI composition loop. API/realtime/desktop state and backend loops are unchanged and not applicable.

# State Ownership

No runtime state changes.

# Memoization

No render changes or new component boundaries.

# Performance Evidence

Harness-only work; fixture correctness rather than latency claims.

# Verification

make verify-plan selected full frontend scope. make verify passed hooks, check/test (110 runtime tests plus harness fixtures), browser UI (79), production routes (7) and style studio (3). Composition fixtures accept valid shell/fragment headers and reject nested wrappers. Four page-family governance tests cover required fields, CSS/entry/component paths, placeholders, deletions, title matching, historical policy and non-UI exemptions. Initial docs formatting failure was corrected before the passing run. No selected checks omitted; real provider/native execution is unrelated to this harness-only change.

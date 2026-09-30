# Commit Title

test(ui): measure contrast after selection transitions

# Changed File Scope

Browser hover-contrast helper and this worklog, within account-experience PR #29.

# Reason

Linux CI sampled a just-selected card during its background transition (3.59:1),
although the existing assertion is intended to check before/after-hover states.
Local runs had already reached the final style, making this timing-dependent.

# Design

Before both contrast samples, await the control's current finite Web Animations
promises. Preserve the 4.5:1 threshold and real computed-color measurement. Do not
change production styles or replace visual checks with static class assertions.

# Verification Plan

Inspect actual browser transition properties and intermediate/final colors; run
make verify-plan and the affected make test-ui group. Reuse unchanged check/unit/
production-route/studio evidence from 0034; require CI rerun on this PR.

# Impact

Test-only timing correction; no account or rendering behavior changes.

# Loop Alignment

UI composition/browser verification loop applies. API, realtime and desktop recovery
loops are not changed by this test-only helper update.

# State Ownership

N/A: production state ownership is unchanged.

# Memoization

N/A: no runtime rendering changes.

# Performance Evidence

Runtime inspection observed background-color and border-color transitions on the
selected control. The helper now measures their final style, matching its existing
after-hover behavior. No runtime performance claim.

# Verification

make verify-plan selected UI scope. The affected make test-ui group passed all 69
cases. check/unit/build evidence from 0034 remains valid because production code and
those test inputs are unchanged; no scope downgrade or contrast threshold change.
Formatting/diff and governance checks passed. Required CI reruns the full PR scope.

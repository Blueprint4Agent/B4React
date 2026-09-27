# Commit Title

<!-- Exact planned Conventional Commit title; finalize before commit. -->

# Changed File Scope

<!-- Files/layers expected to change. -->

# Reason

<!-- Problem and intended outcome. -->

# Design

<!-- Backend: request/service/data/error/event/task path and contract/migration impact.
Frontend: page/hook/API path, reused UI, showcase impact. Infra-only: explain N/A. -->

# Verification Plan

<!-- Relevant Make targets and any runtime checks. -->

# Impact

<!-- Behavior, compatibility, rollout and data implications. -->

# Loop Alignment

<!-- Applicable backend/frontend loops; explain non-applicable loops. -->

# State Ownership

<!-- For frontend runtime/dependency changes: local/URL/context/store/server owner,
consumers, update frequency, reset/persistence, and Zustand/RTK decision if relevant.
For non-runtime tasks state N/A with the reason. -->

# Memoization

<!-- Default: React.memo for repeated expensive children with unchanged props.
Record boundary, stable object/function props, useMemo/useCallback needs, context updates,
and why applied or not. No blanket wrappers or custom deep comparisons without evidence. -->

# Performance Evidence

<!-- Concrete render/request/bundle measurements or regression tests; for no optimization,
explain why and how correctness was checked. Do not claim unmeasured latency improvements. -->

# Verification

<!-- Replace with observed results and task-specific reasons for skipped checks. -->

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

# Page Family

<!-- Required for UI source/style changes. Identify the existing family before implementation;
record actual peer comparison after verification. Explain non-applicability instead of bare N/A.
Use the five level-two headings below; see notes/page-families.md. -->

## Family

<!-- Settings, auth, collection, modal, standalone pricing, or documented new family. -->

## Reference

<!-- Concrete existing peer/component paths; for a new family name the new canonical owner. -->

## Shared Rules

<!-- Shell, width, header/content gap, surface, typography, actions and responsive rules reused. -->

## Exceptions

<!-- None with reason, or precisely scoped domain difference and rationale. -->

## Evidence

<!-- Browser comparison at mobile/desktop and light/dark; actual test/artifact paths.
For nonvisual UI-source edits explain why the existing comparisons remain valid. -->

# Commit Title

feat(admin): display object storage provider status

# Changed File Scope

Admin storage status schema/service/router, safe metadata, tests, contract, docs and frontend integration.

# Reason

Show configured object storage alongside existing server dependencies without exposing deployment identifiers.

# Design

Reuse admin-only status API and cached single-flight integration checks. Project only provider enum, transport enum, port, probe scope, timestamp and measured latency. Never expose paths, buckets, endpoints, credentials or raw failures. Reuse existing settings rows and locally served logos. Per user feedback, omit the per-row probe explanation and checked-at text; retain the existing page-level timestamp.

# Verification Plan

Root verify-plan/verify; auth, sanitization, failure/cache tests; mobile/desktop light/dark peer comparisons and provider logo tests.

# Impact

Additive admin contract; no migration or storage configuration changes. Remote checks use HeadBucket only; local checks use temporary write/read/delete probe.

# Loop Alignment

Existing admin polling/recovery remains owner. Request/service/provider lifecycle retained; no event or background task needed for an on-demand cached read.

# Verification

Root Make full verification passed child static/type/contract checks, 147 tests and 169 browser UI tests. Four provider cases verify bundled logo loading and transport badges; removed explanatory text remains absent. Existing admin role/failure/recovery cases pass. Nine production route tests and three style-studio tests passed. Child verify-plan/verify reused matching delegated receipts and passed hooks-test. No selected checks omitted.

# State Ownership

Existing useAdminStatus owns snapshots, polling and recovery; no extra request or persisted configuration.

# Memoization

One inexpensive dependency row on infrequent snapshots; no expensive stable-prop boundary or new memo wrapper.

# Performance Evidence

Four browser provider tests use the existing single status endpoint and verify local logo assets load. Existing polling/recovery hook is unchanged; no additional provider API request, cache or store. No rendering-speed improvement claimed.

# Page Family

## Family

Admin/settings.

## Reference

AdminServerPage database/cache rows, Home and Settings General shells.

## Shared Rules

Reuse settings-row, server-stack-icon, CodeBadge, status/latency columns and responsive styling.

## Exceptions

None; metadata wraps within the existing row.

## Evidence

Existing AdminServer/Home/Settings geometry comparisons passed at 390/1440px in light/dark. Inspected server-status.png artifacts for 390px dark and 1440px light under test-results/admin-server-\*. Storage matches existing row spacing, wraps metadata without horizontal overflow and has no extra explanatory line.

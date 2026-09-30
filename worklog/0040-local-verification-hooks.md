# Commit Title

ci: move automated verification to local Git hooks

# Changed File Scope

Versioned Git hooks, installer and hook tests; verification receipts; manual workflows, ruleset, Make hooks and English/Korean guidance. Parent also integrates the merged B4React pin.

# Reason

Avoid repeated local, child CI and parent CI verification waits while preserving local checks and PR-based integration, as explicitly requested by the user.

# Design

commit-msg validates the staged worklog and actual message. pre-push validates all authored branch commits and the exact clean pushed HEAD against remote main, then runs change-scoped Make verification. Successful local command receipts may be reused only for identical source/config/tool context; text and governance always rerun. GitHub workflows become manual-only. Remove only required status checks from live rulesets; retain PR, conversations, deletion and non-fast-forward protection.

# Verification Plan

Run isolated real-Git hook acceptance/rejection fixtures, cache invalidation tests, workflow checks, make verify-plan and make verify. Exercise installed hooks during this task commit/push, validate actual PR metadata locally, and read back live GitHub rules. Merge the child first, then parent.

# Impact

No app/API behavior changes. Automatic PR/push/schedule/tag/release jobs stop; manual workflows remain. Hooks must be installed per clone and remain bypassable locally. No remote CI attestation is claimed.

# Loop Alignment

Infrastructure-only: backend request/event/background and frontend API/realtime/connectivity/UI loops are not applicable; their existing test targets are retained in local verification.

# State Ownership

Not applicable: tooling changes introduce no frontend state.

# Memoization

Not applicable: no React runtime changes.

# Performance Evidence

Content/context/config/output/expiry/failure invalidation fixtures passed. Final make verify reused unchanged test-ui and test-style-studio receipts; no UI latency claim.

# Verification

make verify-plan selected full frontend scope for tooling/policy changes. Final make verify passed hooks fixtures (8), receipt invalidation/reuse fixtures (6), existing classifier fixtures (13), check/test (98 frontend tests), production build/routes (6), UI (71) and style studio (3); the last two reused matching successful parent-delegated receipts. Final source was also checked through parent Make integration. actionlint 1.7.12 validated manual workflows. Installed .githooks in this clone. Live ruleset 24035784 read-back confirmed only required_status_checks removed; all other protection fields match exactly. No selected frontend checks omitted; backend loops/tests are not applicable to this standalone tooling change. Manual Actions were syntax-checked, not dispatched, to avoid the duplicate remote execution this task removes.

# Commit Title

feat(api): synchronize billing API key authentication contract

# Changed File Scope

contracts/openapi.json, generated API types and bilingual contract documentation.

# Reason

The provider now permits owner application API keys on all four billing operations.

# Design

Import the coordinated provider contract and regenerate types using this repository's local baseline. Record the new API key errors without modifying runtime authentication or UI.

# Verification Plan

Run make api-generate, make verify-plan, make verify and Git governance checks.

# Impact

Billing accepts bearer or application API keys; account deletion remains bearer-only. No UI or response success shape change.

# Loop Alignment

API state, realtime, desktop recovery and UI composition loops are not applicable: contract/types only, no runtime change.

# State Ownership

N/A: no runtime state change.

# Memoization

N/A: no component changes.

# Performance Evidence

No performance claim; generated contract and existing checks verify compatibility.

# Verification

make verify-plan and make verify passed with full frontend scope: hooks, check/test (102 tests), UI (71), production routes (6), style studio (3). Initial check required formatting the imported JSON with Prettier; all final checks passed. No checks omitted by the full plan; no live provider or UI runtime changes.

# Commit Title

fix(deps): update audited frontend dependencies

# Changed File Scope

package.json/package-lock.json, AdminPage constructor spy fixture, dependency review notes in both languages and this worklog.

# Reason

Fresh installation reported 13 npm advisories, including critical findings in the development test dependency chain. Audit severity alone does not establish application exploitability.

# Design

Update compatible vulnerable dependencies and explicitly move Vitest to the patched 4.x line. Keep React and the existing state architecture; no forced major runtime upgrades. Review the lockfile and run complete regression coverage. Explicitly delegate the Intl constructor spy to the native constructor for Vitest 4; preserve the existing memoization assertions.

# Verification Plan

npm audit before/after and npm audit --omit=dev; child root make verify-plan/verify with full scope and clean installation.

# Impact

Test-tool major update and compatible runtime/build dependency refresh; requires Node 24 as already used by the project.

# Loop Alignment

Existing API state, realtime, desktop recovery and composition loops remain owned by current hooks/components; full tests verify compatibility.

# State Ownership

Existing local/URL/context/server owners remain unchanged; no new global store or persistence behavior.

# Memoization

No application render-boundary changes; no blanket wrappers or speculative optimization.

# Performance Evidence

Use full unit/browser/production-route regression evidence; no latency or bundle improvement is claimed.

# Verification

Clean npm ci passed; npm audit and npm audit --omit=dev each report zero findings (2026-10-11). Full make verify-plan/make verify passed: check, 147 Vitest tests, 188 browser UI tests, 9 production route tests and 3 Style Studio tests. No required suite omitted. The first run exposed the Vitest 4 Intl constructor-spy incompatibility (146 passed, 1 failed); explicit native delegation fixes it and focused 2 tests plus full 147 pass. DebugMCP breakpoint request did not respond; focused reproduction and the official migration guide provided the diagnosis without runtime logging. Existing loop/state/page ownership remains unchanged.

# Page Family

## Family

Existing settings/auth/home/showcase families remain unchanged.

## Reference

Current pages and shared app.css; dependency-only implementation scope.

## Shared Rules

No shell, spacing, typography or responsive policy changes.

## Exceptions

None.

## Evidence

Full browser regression comparisons cover existing mobile/desktop and light/dark geometry.

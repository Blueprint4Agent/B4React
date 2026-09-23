# Commit Title

refactor(frontend): make B4React independently buildable

# Changed File Scope

Build and generation scripts, local contracts, Makefile, CI, repository policies,
English/Korean guides, package identity and lockfile metadata.

# Reason

Share one frontend between independently selected backend implementations.

# Impact

Preserve extracted frontend history. Builds produce only local dist; API generation
uses the pinned contract. Parent repositories own packaging and select a gitlink.
Desktop application identity remains stable.

# Verification

`make api-generate format check test build` passed: 51 tests, formatting, TypeScript,
generated-type drift, and production build. No backend process or parent files required.

# Loop Alignment

API state, realtime refresh, desktop connectivity recovery, and UI composition loops
are preserved; runtime application code is unchanged. Backend loops are not applicable
to this repository extraction. Existing SSE revalidation limitations remain unchanged.

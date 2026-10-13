# Commit Title

feat(layout): use runtime deployment configuration

# Changed File Scope

Pinned contract/generated types, AppLayoutProvider, layout guides and provider/production browser coverage.

# Reason

Select a deployment layout through APP_LAYOUT without rebuilding the same image.

# Design

Backend Settings validates sidebar/topnav/focused and exposes app_layout through the existing no-store /config response. The shared frontend config snapshot owns the deployment default; development-only browser previews override it. Missing/invalid remote layout falls back to the source default for older providers. No DB, new endpoint, store, polling or background work.

# Verification Plan

Run make verify-plan and make verify. Cover settings validation, /config values, deployment default precedence, config refresh preserving drafts, and the same production build in all three layouts. Synchronize EN/KO deployment instructions and contract snapshots.

# Impact

Additive optional response field with sidebar default. Changing the environment requires container recreation and browser reload, not an image rebuild. Production ignores browser preview state.

# Loop Alignment

Existing settings-to-config request path and shared API state loop are reused. UI composition reuses the existing three shells. No realtime event or background/desktop recovery changes are required for process-level configuration.

# Verification

make verify-plan selected full frontend verification. Root delegated Make checks passed: check (22.5s), 201 unit/component tests (3.8s), 240 UI cases (76.8s), 13 production route cases and 11 discovery cases (13.5s), and 3 Style Studio cases (6.0s). The initial UI run hit an existing billing-image decode timing assertion; the unchanged full suite passed on the integration run. No required checks omitted. Backend verification belongs to the parent.

# State Ownership

AppConfigProvider retains one server snapshot; AppLayoutProvider derives the default and retains only the existing local development preview. No duplicate server state.

# Memoization

Existing memoized context value remains stable unless derived mode or preview permission changes. No expensive new component boundary warrants memoization.

# Performance Evidence

Provider tests prove server/preview precedence and preserved unsaved drafts after config changes. Existing shared config tests pass; the provider adds no fetch. Three production browser cases select sidebar/topnav/focused against one unchanged build artifact.

# Page Family

## Family

Existing sidebar, topnav and minimal app shells.

## Reference

AppLayout and settings boxed section navigation.

## Shared Rules

Reuse all existing layout markup/styles, theme, roles and responsive behavior.

## Exceptions

None; only the default selection source changes.

## Evidence

Production browser cases passed for all three configured shells on Home and Appearance using the same artifact, with stale browser previews ignored. Existing 240 UI cases cover mobile/desktop shell and settings peers without style changes.

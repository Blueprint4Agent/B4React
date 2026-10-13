# Commit Title

fix(layout): restore deployment default from preview

# Changed File Scope

AppLayoutProvider reset action, Appearance button, EN/KO labels/guides and reset tests.

# Reason

A saved sidebar preview hid the live APP_LAYOUT=topnav setting in the user browser. Provide a visible way to stop previewing and follow the service default.

# Design

Add a development-only Use service default Button beside the Appearance explanation. AppLayoutProvider clears its preview state and the deployment-scoped localStorage key; the existing config-derived default immediately applies. Keep the control disabled without an active preview. Storage failures still permit a session reset.

# Verification Plan

Run make verify-plan and make verify; check persisted/session reset, subsequent server default changes and the production-built reset flow. Compare the existing Appearance family at mobile/desktop and inspect the user's live configuration.

# Impact

No server contract or layout style changes in this follow-up. Existing production behavior ignores previews. Reset affects only this browser's layout preview.

# Loop Alignment

Existing settings-to-config request path and shared API state loop are reused. UI composition reuses the existing three shells. No realtime event or background/desktop recovery changes are required for process-level configuration.

# Verification

Full frontend make verify passed: hooks (6.2s), check (21.6s), 203 unit/component tests (3.8s), 240 UI cases (73.9s), 14 production route cases plus 11 discovery cases (13.7s), and 3 Style Studio cases (6.0s). No selected checks omitted; backend tests are unchanged and owned by parent integration. Live browser inspection found preview=sidebar while /config returned topnav. Removing only that preview key and reloading restored topnav.

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

None; reuse the shared text Button within the existing Appearance row.

## Evidence

The live localhost Appearance page showed the reset control beside its explanation. Selecting Sidebar enabled it; clicking it restored Top navigation and disabled it. The original home tab remains topnav with its saved preview removed. The full browser suite includes mobile/desktop Appearance comparisons.

Production browser cases passed for all three configured shells on Home and Appearance using the same artifact, with stale browser previews ignored. Existing 240 UI cases cover mobile/desktop shell and settings peers without style changes.

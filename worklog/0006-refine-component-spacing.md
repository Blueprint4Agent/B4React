# Commit Title

fix(ui): refine component layout and tooltip positioning

# Changed File Scope

- src/styles/app.css
- src/components/ui/overlays/Tooltip.tsx and src/components/layout/AppSidebar.tsx
- tests/e2e/component-layout.spec.ts, Makefile
- FRONTEND.md and notes/ko/FRONTEND.md
- worklog/0006-refine-component-spacing.md

# Reason

Refresh dated component presentation while preserving the existing brand, palette,
light/dark themes, and rounded visual language requested by the user.

# Design

Refine shared panel/control radii, elevation, readable line heights, focus states,
and spacing in the existing global stylesheet. Simplify showcase framing and allow
examples to wrap on narrow screens. Reuse all existing UI components and page/hook
boundaries; no dependency or API changes. Standardize 4/8px spacing and 8/12/16px radii;
refine sidebar/navbar. Fix tooltips measured from stretched navbar wrappers by
anchoring to the rendered trigger in a body portal with viewport collision handling,
scroll/resize updates, and inverse light/dark colors.

# Verification Plan

Run parent make frontend-format-check and make frontend-test; run B4React make check,
make test, and make build. Inspect showcase and login at desktop/mobile widths in
light/dark themes, including compact controls and keyboard focus.

# Impact

Presentation changes across shared components and corrected tooltip placement. Existing labels, behavior,
branding, and public component APIs remain compatible.

# Loop Alignment

UI composition: shared components and app.css remain the single styling source;
check mobile/desktop text fit and stable compact/pagination controls.
API state, realtime refresh, desktop recovery: not applicable to this presentation/tooltip
change; existing hooks, navbar geometry, and connectivity behavior are unchanged.

# Verification

- B4React `make format`, `make check`, `make test` (51 tests), and `make build`: passed.
- Parent `make frontend-format-check` and `make frontend-test` (51 tests): passed.
- `make test-ui`: 6 Chromium cases passed (320/390/1440px, inverse system
  light/dark colors, actual navbar/sidebar anchors, focus/Escape/click behavior,
  nested scrolling, viewport flip, clipped-anchor hiding, expanded sidebar).
- Inspected light/dark showcase and login screenshots at 390px and 1440px.
- Runtime reproduction: a 32px navbar logo had a 642.7px wrapper; tooltip started
  at x=669.9. Fixed tooltip starts 8px after the actual logo. Sidebar toggle and
  wrapper now both measure 44px high.
- DebugMCP session startup timed out; browser DOM geometry inspection established
  the cause instead. Cleared the breakpoint. Native Tauri launch was not run;
  window-control insets are unchanged and desktop component tests pass.
- Reported local CORS error was traced to a separate Observability Lab process
  listening on 127.0.0.1:8000 and returning /config 404 without CORS headers.
  No CORS policy or API behavior changes are included.

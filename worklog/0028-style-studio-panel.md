# Commit Title

fix(showcase): move style controls into a compact side panel

# Changed File Scope

Development editor, showcase preview boundary, shared CSS, localized labels, tests and guides.

# Reason

The showcase components are the preview. A large settings form ahead of them obscures the content and also styles itself, making editing difficult.

# Design

Render a fixed right-hand editor through a body portal, outside the draft CSS boundary. Reserve desktop space; provide a collapsible overlay at narrow widths. Group controls in color, shape, typography and spacing accordions. Pin apply/reset controls, keep diff information in details and replace source-path details with a header reload button. Apply preview colors to the whole catalogue and its surrounding main background; adaptive logos must select the preview theme even when the app theme differs. Reuse ThemePreviewSelector and the catalogue-owned useTheme: changing mode updates and persists the global app theme, including the sidebar and editor; token drafts remain scoped to the catalogue. Synchronize open/close and catalogue layout transitions, with reduced-motion support and an icon-only tooltip collapse control. Add a shared custom ColorPicker dropdown anchored below the input (with viewport fallback), with project-themed saturation/value plane with arrow-key support, a rainbow hue strip and a thin opacity strip; omit presets, duplicate text entry and confirmation controls; register it in the actual showcase. Dynamic picker CSS variables are scoped visual geometry/color values, while appearance stays in app.css. Remove synthetic preview samples; draft variables apply only to the existing component catalogue. Add a shared bounded NumberField with custom increment/decrement controls and a catalogue example; replace native font selectors with the shared DropdownMenu. Numeric fields show units and bounds; font presets use human labels.

# Verification Plan

Child make check/test/build, style editor browser tests at mobile/desktop, existing UI and production suites, visual inspection and root integration checks. Assert the panel remains fixed on scroll, the real catalogue changes while the panel does not, and hiding controls retains the draft.

# Impact

Read snapshots add full-theme preview variables; write validation and preview/apply/conflict semantics remain. Local editing server continues running for the user.

# Loop Alignment

Existing page/hook/API flow retained, shared controls and CSS reused. Draft preview only; no new realtime or desktop loops. Backend loops are not applicable.

# State Ownership

Panel visibility and expanded groups remain editor-local. Draft remains in the development hook. CSS variables attach only to the catalogue component container, not the portal editor.

# Memoization

Input state remains inside the editor; existing render-isolation test protects the catalogue from React rerenders. The small grouped controls need no additional memo wrappers.

# Performance Evidence

Render-isolation component coverage passes: token typing does not rerender the sibling catalogue. Global mode changes deliberately update the page. Production entry is 397.41 kB / gzip 123.44 kB versus 390.80 / 121.28 before shared ColorPicker/NumberField examples. The development editor and file protocol remain absent from production. No state library or blanket memoization was added.

# Verification

Passed child make check test build, 81 Vitest cases, 4 filesystem/middleware fixtures, 3 style-editor browser flows, 54 existing UI flows and 6 production checks. Root make check test passed, including contracts and architecture. Browser coverage checks numeric bounds, dropdown labels above triggers, draft/reset/conflict, alpha editing, global mode persistence/system changes, adaptive logos and mobile overflow. Visual inspection confirmed Korean controls and anchored minimal palette; hue/opacity bars measure 22px/12px. Native packaging, backend events and desktop recovery are not applicable to this browser-only tool.

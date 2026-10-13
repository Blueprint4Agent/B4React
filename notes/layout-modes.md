# Service layout modes

[한국어](ko/layout-modes.md)

Choose the service default in `src/service.config.ts` and rebuild:

```ts
export const serviceConfig: { layout: AppLayoutMode } = {
    layout: "sidebar", // "sidebar" | "topnav" | "focused"
};
```

- `sidebar`: existing collapsible/resizable left rail. Its default and saved width remain unchanged.
- `topnav`: global navigation in a horizontal header. Narrow screens use a fixed menu icon left of the brand.
- `focused` (Minimal): compact transparent header without a divider; a fixed menu icon left of the brand opens a small navigation popup. The icon does not change while open.

GitHub, User guide and optional support links remain directly available on the right in development; profile/login and desktop connectivity stay available in all modes. Icons use viewport-positioned tooltips. Global navigation has Home and the development-only showcase; it never contains Settings or administrator section lists.

Settings and administrator sections use the existing role-filtered navigation in a boxed left column when the main sidebar is absent. At narrow widths the box becomes a disclosure above the content. Profile/inbox preserve their source navigation context. Home, profile, inbox, error/recovery and auth-overlay pages keep their existing page-family styles. Standalone plans and public introduction retain their independent shells.

When the server `/config` explicitly returns `app_mode=development`, **Settings → Appearance → Layout** changes the shell immediately. This is a per-browser preview stored under the deployment-scoped `blueprint_layout_preview` key. It does not write source files or alter deployment defaults. Invalid stored values fall back to the service default; blocked storage still permits a session preview. Production, loading and unavailable/unknown server modes ignore the preview and hide the selector. Vite development mode is not the gate.

`AppLayoutProvider` owns this rare client preference; shell disclosure remains local, and switching layouts does not remount page drafts or fetch configuration again. No API, account preference, realtime, authentication or authorization contracts change. To publish a selected mode, edit the source default, commit it through B4React and rebuild the consuming service. Browser preview selection alone never changes GHCR output.

The settings container reserves a stable scrollbar gutter and does not translate on section changes. Shared content widths, surfaces and controls remain unchanged; boxed section navigation is the shell-specific exception. `tests/e2e/runtime-modes.spec.ts` covers preview persistence/production isolation, mobile/desktop light/dark peers, tooltips, popup bounds, section position, Korean routes and role restrictions. Provider tests cover configured defaults, storage failures and preserved drafts.

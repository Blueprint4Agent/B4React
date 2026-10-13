# Main page template

[한국어](ko/main-page-template.md)

`MainPageTemplate` is a presentational settings-family layout in `src/components/layout`.
It owns no auth, API, routing-state or storage. Use it inside AppLayout for menu-driven
pages. Home has its own [landing family](page-families.md#home-landing); it no longer uses this template.

- `title`, `description`, `icon`: heading content.
- `actions`: header controls; compose existing `Button`, `DropdownMenu`, etc.
- `menuLabel`, `menuItems`: accessible navigation with stable IDs, router destinations,
  titles, optional descriptions/icons. Filter permissions in the owning page.
- `menuLayout`: `list` (default) or responsive `grid`.
- `children`: additional sections, lists, cards, loading/error/empty states or widgets.

```tsx
<MainPageTemplate
    title="Workspace"
    description="Your daily work"
    actions={<Button onClick={createProject}>Create project</Button>}
    menuLabel="Workspace navigation"
    menuLayout="grid"
    menuItems={items}
>
    <ProjectList />
</MainPageTemplate>
```

`items`, `createProject` and `ProjectList` above are application-owned extension examples,
not built-in features. Keep data fetching in the corresponding hooks/pages; retain the
existing server authorization checks. Do not put fake metrics in the production home.

The development showcase demonstrates grid menus, a header action and extra content.
Keep its shared settings shell/header/row tokens. `contentPosition` supports before-menu
or after-menu (default) placement for template consumers.

Home uses a two-column introduction and real product preview, feature cards, numbered development steps and use cases,
source/guide links and compact account navigation. Its four text preview choices replace
thumbnail images. Preview state remains local, with shared Modal enlargement and keyboard
focus restoration. Images are illustrative demo data; see `public/home-previews/README.md`.
The selected app shell, role filtering, guest sign-in and account destinations remain intact.

Preview screenshots contain demo data, never real accounts or service health. Opening an administrator screen requires the existing role; billing follows configuration and session state. Hero actions scroll smoothly unless reduced motion is requested. The capabilities list covers UI, accounts, billing, cache/realtime, email, object storage, administration/monitoring and deployment; descriptions are supported capabilities, not live enablement indicators.

Optional support: set `VITE_BUY_ME_A_COFFEE_ENABLED=true` and `VITE_BUY_ME_A_COFFEE_URL=https://buymeacoffee.com/yourname` in the frontend environment and rebuild. Both are public build-time values. Creator usernames may contain letters, digits, dots, underscores and hyphens. Only HTTPS creator URLs on buymeacoffee.com (or www) are accepted, without credentials, custom port, query or fragment. The link renders only for server `app_mode=development`; production and unknown/loading modes always hide it, even when enabled. Default is disabled; no third-party script, iframe or tracking is loaded.

The same support option is shown in the persistent sidebar footer, below the project links and above the profile. Collapsed mode uses a coffee icon and Tooltip; expanded mode includes the label. Home contains no coffee link. The global sidebar/header keeps its URL validation and development-only gate.

Home describes profile security, notification inbox, private inquiries and realtime connections (active SSE; opt-in WebSocket provider). Signed-in users get Inbox/Support shortcuts. Showcase uses the Blocks icon. Admins see the real panel without a redundant demo entry. The inquiry demo reuses the support screen with localized synthetic records and no private inquiry requests or mutations.

Home section links live in the header for topnav/minimal layouts; sidebar uses a floating capsule. Native fragment links target preview, features, workflow and use cases with a scroll offset; smooth scrolling respects reduced motion. GitHub/guide icon pills sit in the hero. Home puts the preview border on the image only and removes browser chrome; static /about keeps its existing frame. Footer product/resource/account columns reuse existing destinations and role gates. Use cases are possible applications, not customer claims.

Preview rotation advances every six seconds, including while hovered or focused. Explicit pause, enlargement, offscreen/hidden state and reduced motion stop it. A CSS progress line follows the same pause state. Four mounted images crossfade without replacing image sources; reduced motion removes the transition. Header links are centered within the header and use a separate mobile row; only sidebar uses a capsule. The footer spans the main area. No landing background effects or extra top-right GitHub button are added; the existing global GitHub stays.

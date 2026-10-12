# Main page template

[한국어](ko/main-page-template.md)

`HomePage` owns account-aware destinations and role filtering; both runtime modes open it by default.
Guests receive generic content and sign-in entry points; no private data is fetched. `MainPageTemplate` is a presentational
layout in `src/components/layout`: it has no auth, API, routing-state or storage ownership.
Use it inside `AppLayout`. `/home` shares the settings-family shell padding; register future
routes with that same shell when reusing this family.

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

The development showcase's `MainPageTemplate` example demonstrates grid menus, a header
action and extra content. The home in both modes uses the list variant and real settings destinations.
Preserve the settings shell/header/row tokens and use `src/styles/app.css` for scoped layout.

Home now places a project introduction before account navigation using `contentPosition="before-menu"` (default remains `after-menu`). The region contains a static overview, local EN/KO light-theme screenshots and capability descriptions. Preview selection is local component state; it does not query APIs or override theme preference. Screenshots are illustrative; see `public/home-previews/README.md`. Header, width, rows and auth/role filtering remain shared with Settings.

The home preview browser provides four thumbnail choices (showcase, user directory, server status and billing), descriptions, a keyboard-dismissible shared Modal for larger images, and in-app destinations. Developer catalogue navigation is shown only in development mode. Both hero actions use the same shared Button. Visible service labels use `nav.brand` (B4A). Preview and dialog state remain local.

Preview screenshots contain demo data, never real accounts or service health. Opening an administrator screen requires the existing role; billing follows configuration and session state. Hero actions scroll smoothly unless reduced motion is requested. The capabilities list covers UI, accounts, billing, cache/realtime, email, object storage, administration/monitoring and deployment; descriptions are supported capabilities, not live enablement indicators.

Optional support: set `VITE_BUY_ME_A_COFFEE_ENABLED=true` and `VITE_BUY_ME_A_COFFEE_URL=https://buymeacoffee.com/yourname` in the frontend environment and rebuild. Both are public build-time values. Creator usernames may contain letters, digits, dots, underscores and hyphens. Only HTTPS creator URLs on buymeacoffee.com (or www) are accepted, without credentials, custom port, query or fragment. The link renders only for server `app_mode=development`; production and unknown/loading modes always hide it, even when enabled. Default is disabled; no third-party script, iframe or tracking is loaded.

The same support option is shown in the persistent sidebar footer, below the project links and above the profile. Collapsed mode uses a coffee icon and Tooltip; expanded mode includes the label. Home uses a compact support link beside the brand label at the top of the introduction; there is no separate bottom support block. Both locations share the same URL validation and development-only gate.

Home describes profile security, notification inbox, private inquiries and realtime connections (active SSE; opt-in WebSocket provider). Signed-in users get Inbox/Support shortcuts. Showcase uses the Blocks icon. Admins see the real panel without a redundant demo entry. The inquiry demo reuses the support screen with localized synthetic records and no private inquiry requests or mutations.

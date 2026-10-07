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

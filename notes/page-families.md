# Page family consistency

[Korean](ko/page-families.md)

Shared controls and one CSS file are necessary but do not guarantee consistent pages.
Before changing UI, identify the page family and an existing peer. Reuse its shell,
content width, header/body gap, surface, typography, action placement and responsive rules.
A visual reference supplies intent; it does not replace the host application's rules.
Do not copy token values into domain CSS when the existing shared class can own them.

| Family            | Starting reference                                      | Common rules / legitimate differences                                                                                                                                                                                                                   |
| ----------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Settings          | `src/pages/settings/SettingsPage.tsx`, General section  | Shared settings shell/header; `settings-general-content` and `settings-row` for standard rows. Account may retain its existing profile/photo and deletion compositions. Domain content can differ; header placement and standard surfaces cannot drift. |
| Auth              | `src/pages/login/` existing login/signup/reset screens  | Existing auth shell, form controls, validation and action placement; compare the closest form peer.                                                                                                                                                     |
| Collections/admin | `src/pages/admin/`, `notes/collections.md`              | Existing collection query, table/list, toolbar, pagination and state patterns. Different columns do not justify a second toolbar design.                                                                                                                |
| Modals            | `src/components/ui/` Modal and existing feature dialogs | Shared clipped shell, fixed header/footer, inset scrolling, focus and actions. Domain fields vary.                                                                                                                                                      |
| Standalone plans  | `src/pages/billing/PlansPage.tsx`                       | Independent fullscreen close/scroll surface, not the Settings shell. Keep its explicit family boundary.                                                                                                                                                 |

For a new family, document its canonical owner and reusable rules here before creating a
second instance. For mixed pages identify each region's family. Do not force different
families to have identical dimensions. Record narrowly scoped exceptions with reasons;
apply a common-rule change to affected peers together instead of adding domain overrides.

## Required worklog review

UI changes under pages/components, app entry/routing, and styles require `# Page Family`
in the title-matching worklog, with `## Family`, `## Reference`, `## Shared Rules`,
`## Exceptions`, and `## Evidence`. Start the comparison plan before implementation.
Before committing, replace plans with observed results and test/artifact paths. Bare
N/A, TODO, comments, or another commit's worklog do not satisfy review. Nonvisual source
changes explain why family styling is unaffected and which existing coverage remains valid.
Docs/test/hook-only changes do not require this review. Deletions/renames still count.

## Verification and limits

Use `make verify-plan` and `make verify`. `make ui-composition-check` rejects a settings
header nested in a domain wrapper (the duplicate-gap regression). A settings header belongs
directly in the shared shell or at a fragment root composed into that shell. Governance
checks read policy and worklog from the same index/commit snapshot; older commits retain
their original policy. Python rejection fixtures run in the standard `make check` chain.

For visual edits compare a peer at mobile/desktop and light/dark, including long localized
text, empty/loading/error content and actions where relevant. Record which checks apply.
Use browser geometry/computed styles and screenshots, not only absence of overflow. Existing
`tests/e2e/billing.spec.ts` compares Billing against General header gap and row width,
padding, border, radius and background at 390/1440px in both themes. It also covers Korean
mobile text and registration states. Extend the affected family's checks for new layouts.

Static checks cannot determine all semantic page families or prove visual equality.
The worklog gate enforces recorded review, not truthfulness of prose. Browser comparisons
cover registered cases, not arbitrary new pages. New families require review and coverage;
passing shared-control checks alone is never evidence of consistent page composition.

Server-unavailable recovery uses the main `AppLayout` sidebar (the showcase route is its peer), shared PanelCard typography and Button. Center one panel capped at 30rem inside the existing content area; omit the public navbar and nested warning card. Keep config retry and delayed loading behavior in the existing owners.

Administrator users and server status reuse the settings/home 50rem shell,
shared header spacing and token-based surfaces. The wide user table scrolls
inside its region instead of widening the page. Server health uses StatusBadge
with a colored dot and text; stale snapshots stay explicitly marked. OAuth
provider marks reuse OAuthProviderIcon and locally bundled stack marks record
provenance in public/stack-brands/README.md.

CodeBadge renders technical labels and allowlisted configuration values as semantic
code with the compact KeyboardShortcut surface treatment. It wraps long content,
has no interaction and is registered in the searchable showcase. Admin environment
values pair localized meaning with the actual safe boolean or runtime-mode value.

Keyboard settings reuse General row/header composition. Both app shortcuts can be customized/reset per browser by clicking a key card; duplicate bindings are rejected and clicking away cancels capture. Each settings section replays the existing entry animation. Default/pill actions share the 32px dropdown height; coarse pointers retain 44px targets. Profile subscription markers use a fixed 16px circle with a centered glyph. Home/admin headers omit icons like Settings.

Profile role badges belong inside the photo card. Compact option menus open toward the right from the trigger left edge and clamp to the viewport. Destructive options use red in both themes. Keyboard follows Account in the sidebar and uses toast notices for duplicate shortcuts.

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

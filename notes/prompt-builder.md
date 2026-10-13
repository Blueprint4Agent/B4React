# Guided prompt builder

[한국어](ko/prompt-builder.md)

The global **Prompt builder** entry follows Home in sidebar, topnav and minimal layouts.
`/prompt-builder` is lazy-loaded inside the existing AppShell, available to guests and
members in development and production. Existing config/readiness gates still apply.

Start with the central capsule and choose **Add a feature** or **Start a project**.
Both paths use four questions: **name → implementation scope → features/permissions → delivery**.
Only the name requires typing by default. Scope offers 12 multi-select cards, capabilities
use six multi-select cards, and additional requests are optional. Required/optional badges
and Skip distinguish mandatory inputs. At least one scope is required; selecting actual
deployment requires a target. Deployment setup alone never authorizes deployment.

The RBAC matrix starts with Guest denied, User CRUD on own records, Manager read within
the service/tenant, and Admin CRUD within that boundary. Every action is editable; own/all
data scope is selectable for authenticated roles. Guest access is limited to public data.
These are editable prompt defaults, not changes to the running service's permissions.
Generated instructions require server enforcement and flag conflicts/dependencies rather
than weakening existing policy. UI-only work excludes API/business/data-policy changes.
Review and edit four answer groups before generating; stale deployment targets are excluded
unless deployment is selected. Unselected capabilities receive a minimal-behavior suggestion.

The result is deterministic localized Markdown with requirements, scope boundaries,
repository inspection, design, implementation, verification and integration instructions.
Copy uses the browser clipboard, with manual selection/download fallback when unavailable.
Download exports the exact visible text as a UTF-8 `.md` file. No model or repository scan
is executed by this page; it does not claim analysis or checks already passed. Selecting
a delivery scope writes instructions only; this UI never commits, merges or deploys.

Drafts and steps belong to the page, with separate in-memory answers for each path.
Leaving/reloading resets them. No answers are stored persistently or sent to an API.
Restart requires confirmation and clears both drafts. No new provider/store/dependency,
backend contract or realtime/background operation is introduced.

The page reuses MainPageTemplate's settings-family shell, width, title and mobile padding;
shared InputField/TextareaField, FormCheckbox, DropdownMenu, SelectionCard, Button capsule variants and Modal own controls.
Scoped CSS adds equal-width choices, progress and short transitions. Ambient gradients
are noninteractive, softly masked and static under reduced motion. Programmatic heading
focus announces each step; keyboard controls retain shared visible focus styles.

Verification: promptBuilder unit/component tests cover validation, draft isolation,
RBAC, delivery boundaries and scope; `tests/e2e/prompt-builder.spec.ts` covers both guest production
journeys, review edits, clipboard failures/success, exact downloads, shell modes, General
peer geometry and Korean light/dark 390/1440 screenshots. Production routes verify lazy
chunk loading and direct reload. These browser cases run through `make test-ui` / `make test-routes`.

## Flow review

Observed in browser automation and Korean 390/1440 light/dark screenshots, not a user study:

- Input burden: one required text field, one required multi-select; the other two questions accept defaults. Deployment alone adds a required target.
- Clarity: concrete action/data permissions replace abstract audience text. Checkboxes support pointer and keyboard input; review preserves changes exactly.
- Safety: deselected elements and stale deployment targets do not leak into output; local/PR/merge/deploy stopping points remain explicit.
- Remaining friction: four questions still sit between welcome/path selection and review/result (eight screens total). The capability/permission screen is the densest; mobile requires vertical scrolling. Defaults and Skip keep detailed editing optional.
- Prompt quality: selected capabilities add behavioral checks and authorization boundaries. Names alone cannot specify domain rules, so essential missing rules must be clarified by the implementing agent. This flow does not guarantee unattended implementation for every idea.

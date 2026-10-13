# Commit Title

feat(prompts): add guided service prompt builder

# Changed File Scope

App route/navigation, prompt page and model, locales, shared stylesheet, tests, Makefile, bilingual docs, worklog

# Reason

Help users turn a feature idea or a new service into a complete harness-aware implementation prompt, available below Home in production and development.

# Design

Lazy public /prompt-builder route inside existing AppShell. Reuse MainPageTemplate settings-family shell, SelectionCard, TextareaField, Button, Modal and InlineMessage. Centered capsule welcome, two path cards, then one question at a time with short reduced-motion-aware transitions and progress. Page-local separate feature/project drafts with four questions: name, multi-select scope, capabilities/RBAC, and delivery; review/edit then deterministic localized Markdown generation, clipboard fallback and Blob download. Both paths first ask the feature name, then multi-select implementation areas and API/database/auth/realtime/jobs/uploads/billing/tests/deployment elements. Required/optional badges and Skip for optional questions keep the flow explicit. Only the name requires typing by default; optional notes and a required deployment target appear in context. Capabilities use multi-select cards; the editable Guest/User/Manager/Admin matrix selects read/create/update/delete and own/all data. Shared FormCheckbox and DropdownMenu own permission controls. No API, persistent storage, external AI or new dependency. User refinements: remove introductory prose, use existing pill/pill-secondary navigation buttons, a distinct FilePenLine icon, and a scoped low-contrast animated ambient background (static for reduced motion).

# Verification Plan

Unit tests for draft isolation, four-step validation, RBAC and completion boundaries; production-config browser journeys for both paths, edits, validation, copy failure and download. Compare General family header/surface at 390/1440 light/dark with screenshots; test navigation across shell modes. Run make verify-plan / make verify, production routes and Git governance.

# Impact

Adds a guest-accessible production menu and lazily loaded client-only wizard. Existing authentication and deployment settings remain authoritative. Drafts last only while the page is mounted. No schema/migration or deployment action.

# Loop Alignment

UI composition loop applies through existing shell and controls. API state, realtime, desktop recovery, backend request/event/task loops not applicable: no new HTTP or server state. Existing app config/connectivity gate remains unchanged.

# State Ownership

Page-local step, mode and independent drafts; no persistence, Context, store or requests. High-frequency text input remains in the lazy page. Generated result is derived from the active draft.

# Memoization

No expensive repeated child boundary: a small active question group and review list change with draft input. No blanket React.memo; useMemo keeps generated text stable on unrelated copy/reset UI changes.

# Performance Evidence

Both production guest journeys observed zero prompt-specific mutation requests; input and output remain local. A lazy route import preserves the main entry boundary; the production route test verified the emitted 16.78 kB (gzip 5.06 kB) chunk and direct reload. No user-visible latency claim.

# Verification

make verify-plan selected frontend=full (shared styles, new route and Makefile); make verify passed hooks, check, 209 unit/component/integration tests (44 files), 250 browser cases including 10 prompt flows, 15 production route and 11 discovery cases, and style-studio checks. No backend checks: no server changes. Focused unit/component tests passed 6 cases. Both feature/project flows preserve edited RBAC, copy/download exact output and issue no prompt mutation requests; optional defaults and conditional deployment target are covered. Initial browser checkbox targeting failed because the shared visual label overlays the native input; corrected the scenario to click the visible label and separately use keyboard Space, with checked-state assertions. No forced clicks or runtime workaround. Flow evaluation is recorded in bilingual usage docs: four questions, one required typed field, eight screens including entry/review/output, dense optional RBAC step on mobile, and domain requirements still need essential clarification.

# Page Family

Settings-family workflow with a scoped wizard body.

## Family

Settings / MainPageTemplate.

## Reference

MainPageTemplate.tsx and SettingsPage General section.

## Shared Rules

Reuse settings-layout, PrimaryCard, shared header, 50rem width, theme tokens, form fields and action controls.

## Exceptions

Wizard body adds a step rail, choice grid and readable Markdown output; no replacement shell or page-local style file.

## Evidence

Observed General peer comparison passed in production at 390/1440, light/dark and Korean: matching shell width, padding, background and radius. Shared MainPageTemplate owns the header. Screenshots reviewed under test-results/prompt-builder-wizard-\*/welcome.png, paths.png, question.png and permissions.png. Equal card widths and reduced-motion suppression are asserted; mobile layout has no horizontal overflow. A missing app-shell--settings route classification was corrected to match the peer mobile width.

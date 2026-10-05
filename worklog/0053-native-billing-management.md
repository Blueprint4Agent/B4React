# Commit Title

feat(billing): manage billing details and cards in app

# Changed File Scope

Billing API adapter/hooks, profile/card modals and list actions, shared styles, locales, contract, Stripe Elements dependencies, tests and bilingual docs.

# Reason

Edit billing profile inside the app, display real saved cards with direct management, remove the permanent refresh control and avoid portal redirects for profile/card actions.

# Design

Owner-scoped profile updates with structured address. Owner-checked default/detach card actions serialized on the customer row, disallow removal of an active subscription default. Embedded Stripe Payment Element uses card-only SetupIntents and optional mode-matched publishable key; no PAN/CVC enters application APIs. Verify SetupIntent owner/status after confirmation. Preserve separate Link wallet identity when provider does not return underlying card fields. Existing hosted subscriptions/portal invoices remain.

# Menu Follow-up Design

The shared compact DropdownMenu owns icon trigger, content-width right-aligned floating actions, viewport flipping/clamping, optional icons and danger tone. Billing and a searchable showcase example reuse it. Browser checks cover single-line Korean delete, keyboard dismissal, and mobile/desktop light/dark geometry. Read-only provider inspection of the screenshot invoice found only one Link method, no card fields, and no additional pages; do not fabricate wallet card numbers.

# Verification Plan

Ownership, validation, update/default/delete/setup tests; frontend modal and API recovery tests; desktop/mobile browser comparison; Make-selected full verification and contracts.

# Impact

New authenticated APIs and optional publishable-key configuration; no migration or charging behavior change. Existing hosted setup API retained for compatibility.

# Loop Alignment

Router/service/model/provider ownership path retained. Stripe owns setup authentication and storage; no local worker/event needed. Frontend hooks own snapshots/actions with owner-generation guards and focus/online recovery. Shared modal/input/button/feedback controls used.

# Verification

Root `make verify-plan` selected backend + full frontend because APIs/contracts/dependencies/runtime changed; `make verify` passed all selected targets. Delegated `make check test`: 119 tests. `make test-ui`: 102 browser cases, including billing/General family comparisons and compact action menus at 390/1440px in light/dark themes. Production routes, style studio, contracts/package and project build isolation passed. No selected checks omitted; native desktop packaging is outside this browser billing change. Public key account match and synthetic sandbox setup/default/removal passed without a charge; synthetic customer deleted. Link-only source inspection found no card fields, so no wallet card is fabricated.

# State Ownership

Stripe/server owns profile and saved methods; useBilling owns snapshots/mutations; modal owns draft fields. No global store. Client secret only in mounted card dialog memory.

# Memoization

Small controlled forms and provider Element do not justify blanket memoization. Load Stripe only on demand and cache the SDK promise by publishable key.

# Performance Evidence

Action-lock/stale-owner hook regression passed. Lazy provider dialog tests passed for server verification retry without duplicate confirmation, base-path return URL and provider validation retention. Existing production chunk-loading/recovery tests passed; no latency claim.

# Page Family

## Family

Settings and compact form dialogs.

## Reference

SettingsPage profile editing, AccountDeletionDialog, shared Modal/InputField/ModalButton and existing billing list.

## Shared Rules

Reuse dialog shell, focus/scroll, form spacing, settings surfaces, feedback and action styles. Screenshot is a content reference, not a replacement theme.

## Exceptions

Stripe hosts sensitive card fields within its Element iframe; appearance uses matching light/dark theme.

## Evidence

`tests/e2e/billing.spec.ts` compares Billing with General shell/header/rows at 390/1440px in light/dark and covers native profile/card default/delete actions. Shared compact Modal screenshots (`profile-dialog.png`) showed inset scrolling, fixed actions and no viewport overflow. `billing-method-menu.png` and showcase `action-menu.png` showed one-line Korean delete, icon/danger color and unclipped content-width menus; geometry checks asserted viewport bounds. Escape restored trigger focus. Full browser suite: 102 passed.

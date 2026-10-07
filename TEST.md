# Frontend Test Engineering Guide

This document defines frontend test architecture and execution rules for this repository.

## 0) Scope and Priority

- Scope: everything under `src/tests` and `tests`.
- Read order before frontend test work:

1. Root `AGENTS.md`
2. `FRONTEND.md`
3. This document (`TEST.md`)

## 1) Test Pyramid (De Facto)

1. Unit: pure utils and small logic branches
2. Component: page/component user interaction and rendering behavior
3. Integration: API layer + hook behavior with MSW
4. E2E: browser route smoke and critical user journey with Playwright

## 1.1) Backend-Scenario Alignment Rule

Frontend scenario tests must track backend `full-system` sequence from:

1. [B4FastAPI test guide](https://github.com/Blueprint4Agent/B4FastAPI/blob/main/src/backend/TEST.md) (`## 8.1) Seeded Full-System Scenario Sequence`)

Alignment policy:

1. Keep principal/credentials/API key names in shared scenario fixture (`src/tests/fixtures/fullSystemScenarioData.ts`).
2. Cover backend contract branches that are reachable from frontend UX.
3. For backend-only flows not exposed in frontend UI (for example API-key auth via `X-API-Key` on `/auth/me`), document as out-of-scope and keep validation in backend tests.

## 2) Current Test Layout

```text

  src/
    tests/
      unit/
        hooks/
          serverConnectivity.test.ts
        utils/
          apiBase.test.ts
          desktopRuntime.test.ts
          validation.test.ts
      component/
        App.test.tsx
        components/
          layout/
            AppSidebar.test.tsx
            DesktopTitleBar.test.tsx
        pages/
          login/
            LoginPage.test.tsx
          settings/
            SettingsPage.test.tsx
      integration/
        api/
          configApi.test.ts
          systemApi.test.ts
        hooks/
          useAuth.test.tsx
          useFeatures.test.tsx
          useServerConnectivity.test.tsx
      fixtures/
        fullSystemScenarioData.ts
      setup.ts
      mocks/
        handlers.ts
        server.ts
      utils/
        renderWithRouter.tsx
  tests/
    e2e/
      auth-smoke.spec.ts
  playwright.config.ts
```

## 3) Tooling

1. Unit/Component/Integration: `Vitest + Testing Library + MSW`
2. E2E: `Playwright`

## 4) Marker-free Execution Commands

Run all Vitest suites:

```bash
cd B4React
npm run test
```

Run unit tests only:

```bash
cd B4React
npm run test:unit
```

Run component tests only:

```bash
cd B4React
npm run test:component
```

Run integration tests only:

```bash
cd B4React
npm run test:integration
```

Run full test matrix in sequence (unit -> component -> integration -> e2e):

```bash
cd B4React
npm run test:all
```

Run Vitest in watch mode:

```bash
cd B4React
npm run test:watch
```

Run E2E route smoke:

```bash
cd B4React
npm run test:e2e
```

Run E2E with UI mode:

```bash
cd B4React
npm run test:e2e:ui
```

## 5) MSW Rules

1. Default API mocks are centralized in `src/tests/mocks/handlers.ts`.
2. Tests that need branch-specific payloads must override handlers with `server.use(...)`.
3. Unhandled requests are treated as failures (`onUnhandledRequest: "error"`).

## 6) Test Writing Format

Each test should keep scenario intent explicit using Given/When/Then comments.

Template:

```ts
it("<behavior>", async () => {
    // Given: ...
    // When: ...
    // Then: ...
});
```

## 7) Domain Onboarding Rules

When a new frontend domain is added:

1. Add unit tests for shared domain utils (if any).
2. Add component/page tests for key interaction and validation flows.
3. Add integration tests for API module error/success branches using MSW.
4. If route is critical, add at least one Playwright route smoke case.

## 8) Current Scenario Inventory

1. `src/tests/unit/utils/apiBase.test.ts`
    - Local loopback hostname alignment for same-site authentication cookies.
2. `src/tests/unit/utils/desktopRuntime.test.ts`
    - Browser/Tauri runtime distinction and desktop platform detection.
3. `src/tests/unit/utils/validation.test.ts`
    - Email/password validation success and failure branches.
4. `src/tests/component/components/layout/DesktopTitleBar.test.tsx`
    - Browser hidden state, native macOS controls, Windows window actions, and standalone connectivity placement.
5. `src/tests/integration/api/configApi.test.ts`
    - `/config` success and failure API response handling.
6. `src/tests/component/pages/login/LoginPage.test.tsx`
    - Invalid email client-side validation branch.
    - Successful login submit + navigation branch.
    - `INVALID_CREDENTIALS` remaining-attempts branch.
    - `EMAIL_NOT_VERIFIED` + resend verification branch.
7. `src/tests/component/pages/settings/SettingsPage.test.tsx`
    - Role badge visibility branch:
      admin role shows badge, user role hides badge.
    - Backend-aligned API key lifecycle flow:
      create -> reveal -> list-visible -> disable -> enable -> delete.
    - Backend-aligned error branches:
      duplicate-name (`API_KEY_NAME_ALREADY_EXISTS`), delete not-found (`API_KEY_NOT_FOUND`).
8. `src/tests/integration/hooks/useAuth.test.tsx`
    - refresh bootstrap success branch (no token -> refresh -> me).
    - stored token + `/me` success branch (refresh skip).
    - `/me` fail + refresh fail branch (token clear and logged-out state).
    - logout API failure branch with client-side session clear in `finally`.
9. `tests/e2e/auth-smoke.spec.ts`
    - Browser-level `/login` route render smoke.
10. `src/tests/unit/hooks/serverConnectivity.test.ts`
    - Exponential reconnect delay, cap, and jitter boundaries.
11. `src/tests/integration/api/systemApi.test.ts`
    - Ready and degraded `/health/ready` response handling.
12. `src/tests/integration/hooks/useServerConnectivity.test.tsx`
    - Browser polling exclusion and Tauri offline-to-online recovery.
13. `src/tests/component/App.test.tsx`
    - Fail-closed protected routing, shared app-sidebar structure without a public navbar, and delayed retry loading state when `/config` is unavailable.
14. `src/tests/integration/hooks/useFeatures.test.tsx`
    - Configuration failure remains distinct from explicit login disablement and recovers on retry.
15. `src/tests/component/components/layout/AppSidebar.test.tsx`
    - Compact desktop connectivity status placement beside the profile control, stable retry label, and offline logout blocking.
16. `src/tests/component/pages/main/LandingPage.test.tsx`
    - Shared public-navbar structure and landing navigation behavior.

## 8.1) Backend Full-System Mapping (Frontend-Reachable Subset)

Mapped Auth branches:

1. Login success
2. Login invalid credentials with remaining attempts
3. Email-not-verified + resend verification action
4. Malformed email client-side validation
5. Session bootstrap via refresh when access token is missing
6. Session clear path when `/me` and refresh both fail
7. Logout `finally` clear path even if logout API fails

Mapped API key branches:

1. Create API key success
2. Duplicate API key name conflict
3. Key appears in list after create
4. Key disable status update
5. Key enable status update
6. Key delete success
7. Key delete not-found branch

Backend-only (not frontend-reachable) branches remain backend-owned:

1. API-key-based `/auth/me` auth success/rejection (`X-API-Key`)

## 9) Verification Checklist

Before commit:

```bash
cd B4React
npm run format
npm run format:check
npm run test
npm run build
```

## Sidebar layout regression coverage

`make test-ui` checks collapsed/expanded desktop and mobile geometry, brand hover and toggle placement, identical light/dark sidebar surfaces, reduced motion, compact tooltip dismissal, profile popover bounds and keyboard escape, menu spacing, and coarse-pointer targets. DesktopTitleBar component tests preserve native app dragging and window controls.

Settings browser checks cover shared sidebar navigation, return-to-app state, responsive appearance previews, and persisted system/light/dark selection.

Sidebar resize coverage verifies dragging, saved width across route changes/reload, keyboard bounds, matching profile popup width, and retained settings chrome.

API-key browser checks cover populated table metadata/statuses, horizontal containment on mobile, and compact creation dialog bounds. Component scenarios retain create/reveal/toggle/delete and six-row pagination coverage.

Keyboard shortcut unit checks cover platform formatting, exact modifiers and
input/composition/modal exclusions. Browser checks exercise Mac/Windows/Linux
shortcuts and verify dropdown-to-trigger alignment at mobile and desktop widths.

Guest auth browser tests run through `make test-ui`: public entry, profile login,
configured/disabled providers, email-first validation, signup overlay, guest
settings, Escape/focus containment and responsive bounds. Existing component tests
continue verifying login success/errors/resend and API-key modal actions.

Recovery browser checks cover empty-email validation, sent confirmation, signup
criteria, missing reset token feedback and the shared showcase auth preview.

Recent-account tests cover bounded/deduplicated/expired storage, consent, OAuth
return validation, token-cache clearing, profile image refresh, removal and blocked
storage. Browser tests verify history ordering/selection/deletion and opening an
additional account login while preserving the current authenticated session.

Guest settings browser coverage verifies public General/Appearance, hidden account sections, direct-link normalization and no account requests.

Catalog browser cases cover component-name search, category selection, no-results/reset, local API-key toggling, OAuth preview isolation and mobile overflow. UI composition harness fixtures verify import aliases, missing exports, same-name impostors, inline appearance, extra stylesheets, copied button classes and geometry exceptions.

Page-state browser tests exercise loading preview exit, actual unknown-route 404 recovery and viewport bounds at 320/1440px. Harness fixtures also reject UI exports missing from the public barrel.

Admin panel tests cover role-gated menus/routes, paginated search, empty/error/retry states, mobile/desktop containment, stale-account response rejection and desktop recovery.

React performance checks run through `make react-performance-check` / `make check` with positive and negative static/policy fixtures. AdminPage regression tests count date-format work during unrelated search typing and verify data/locale/loading/error updates still render. Production chunk tests run through `make test-routes`, including deferred navigation, retained shell, reload and home recovery. Required Frontend checks CI installs Chromium and runs these production cases. See [performance decisions](notes/react-performance.md) for evidence and limitations.

## Project branding

`make project-config-check` validates optional public identity and checks HTML escaping and Tauri override merging. `make test-routes` also verifies English/Korean title, wordmark, logo and favicon in a production build, using `project.local.json` when present. These checks keep default and customized copies testable without a parent repository.

`make style-studio-check` verifies real isolated file reads/writes, backups, revisions,
validation and local middleware access. `make test-style-studio` checks draft/reset,
light/dark separation, apply/conflict and mobile/desktop layout with mocked writes
so tests never modify developer CSS. The component test protects render isolation
and cleanup. Production tests assert the editor/file protocol are absent.

Theme contrast regressions cover enabled hover text pairs, disabled hover stability, sidebar separation, system/explicit appearance and searchable keyboard-operated SelectionCard examples at mobile/desktop sizes. Screenshots capture surfaces, cancel hover and selection states.

ToastCard component tests cover StrictMode expiry/exit, keyed replay, timer cleanup, callback replacement, blank messages/duration bounds and isolated preview renders. `make test-ui` verifies real timed dismissal, top-center capsule geometry, light/dark contrast, focus retention, reduced motion and mobile/desktop screenshots.

Action feedback regressions cover signup/reset-email pending and rejected requests, retry navigation with a surviving success toast, login outcomes, clipboard denial, API-key mutation feedback and stable dispatch consumer render counts.

## Scoped verification policy

[Change-scoped verification](notes/verification.md) supersedes unconditional check/test/build lists for documentation and structurally unchanged locale copy. Use make verify-plan / make verify; runtime and UI checks follow the selected plan.

Mocked Playwright suites use tests/fixtures/browser.ts to block unmocked cross-origin traffic. Development test servers override VITE_API_BASE_URL; local .env must never send fixture credentials to a developer backend. Page routes override fixture responses.

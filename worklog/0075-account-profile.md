# Commit Title

feat(auth): add account security and personal profiles

# Changed File Scope

Auth profile schemas, persistence and API contracts; standalone profile and account settings UI, translations, tests and bilingual guides.

# Reason

Resolve B4FastAPI #92 by separating personal presentation from account security.

# Design

Profile lives at /profile in the persistent AppShell, with dropdown/account navigation, photo overlay and a modal with photo controls. Password change opens a modal. Both surfaces reuse the subscription snapshot. Country/region linked dropdowns store validated catalog IDs. Reuse GET/PATCH /auth/me and managed photo operations. Add nullable bio/location and migration 0016. Bearer-only password change requires a purpose-bound emailed code with expiry, retry/attempt budgets and revokes refresh sessions. Email-disabled operations fail closed. Personal profile only; no public lookup.

# Verification Plan

Run root make verify-plan then make verify. Cover ownership, validation, persistence, password failures and success; browser profile/account and General peer at mobile/desktop in both themes.

# Impact

Apply migration before rollout. Existing accounts have empty optional profile fields. Photo storage remains unchanged.

# Loop Alignment

Router/service/repository and page/hook/API loops retained. AuthProvider owns saved snapshot and desktop recovery. Reuse the existing Celery mail task with a password-change mail kind. No new realtime events: explicit mutations/reload refresh personal data; no cross-client live profile guarantee.

# State Ownership

AuthProvider remains the sole confirmed profile owner. Page-local drafts reset on identity/section changes. No new global store.

# Memoization

Forms are small and their props change on typing; no expensive repeated subtree warrants memo wrappers.

# Performance Evidence

Browser regression asserts zero PATCH requests while drafting, one on save, sidebar synchronization and a single subscription read across profile/account navigation. Country-region options memoize only by language/country; no latency claim.

# Verification

Root `REDIS_IN_MEMORY=true make verify-plan` selected backend + full frontend because auth/contracts/shared UI changed. `make verify` passed: 428 backend tests, 147 frontend tests, 181 Chromium UI cases (including all 12 account/profile cases), 9 production-route cases and 3 Style Studio cases, plus static policy/type/format, contract, packaging and project-build checks. Focused account-profile run also passed 12/12. No classifier-selected checks omitted. Browser APIs were isolated fixtures; actual SMTP delivery and native desktop packaging were not exercised because this task adds neither SMTP configuration nor native code. Existing desktop recovery owner is unchanged.

Reviewed screenshots at 390/1440px in light/dark and compact-name/compact-bio captures. Repeated spaces preserve name width and 96px Bio editor height; country menus retain document height and scroll internally. Migration status locally reports 0016_personal_profile head.

# Page Family

## Family

Settings for account; personal-profile for the standalone page; shared Modal for both editors.

## Reference

src/pages/settings/SettingsPage.tsx General section; existing account photo panel.

## Shared Rules

Account reuses PrimaryCard, settings header and settings-row. Standalone profile reuses the app 50rem shell/tokens and adds a centered identity hero/metadata strip. Both editors reuse Modal, InputField, Button and photo controls.

## Exceptions

User explicitly requested a standalone centered profile matching their reference. Documented canonical family in notes/page-families.md; do not copy external colors or invent statistics. Bio and editable avatar are showcased shared controls.

## Evidence

Compared General and Account at 390/1440px in both themes: matching header gap, row width/padding/radius/surface. Profile preserves the same app shell with its documented centered identity exception. Compared password/deletion modal email row geometry. Screenshots produced by tests/e2e/account-profile.spec.ts under test-results; focused compact editor screenshots visually reviewed.

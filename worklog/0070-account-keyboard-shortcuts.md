# Commit Title

feat(settings): persist keyboard shortcuts in account profiles

# Changed File Scope

Pinned OpenAPI, auth/profile types, keyboard provider/settings, localized copy, tests and documentation.

# Reason

Replace browser-owned shortcut settings with durable account-owned database settings.

# Design

Extend existing authenticated GET/PATCH /auth/me with validated keyboard_shortcuts JSON. Null resets defaults; omitted fields preserve existing values. Frontend adopts explicit contract and uses AuthProvider profile updates.

# Verification Plan

Initial plan: root make verify-plan and make verify plus persistence/account/browser checks. User later explicitly stopped full verification; retain focused test and browser evidence, and run staged Git governance before the requested commits.

# Impact

Existing accounts default to standard bindings. Legacy browser data is ignored to avoid importing shared-browser preferences into an arbitrary account. Apply migration before serving.

# Loop Alignment

Request/router/service/repository loops retained. Existing auth bootstrap and desktop recovery refresh server state. No realtime event or worker: small synchronous profile preference updates become visible on reload/login/recovery, not pushed to other active tabs.

# Verification

User explicitly stopped full verification for this task. Root make verify-plan selected backend + full frontend (auth/contract changes); make verify was interrupted during backend checks, so no full-pass claim is made. The user subsequently authorized commit/push/ready PR/automatic merge. Required pre-push checks ran without bypass. Hooks, backend architecture, Ruff lint/format passed before interruption. Focused backend shortcut/runtime-mode tests: 16 passed. B4React typecheck passed; focused shortcut integration/unit tests: 6 passed. Live localhost:5173 B4React authenticated screen saved Command+Shift+B through the profile API, retained it after reload, reset to Command+B and retained reset after another reload. Guest screen showed disabled edit/reset controls. Screenshot: /tmp/b4react-keyboard-db.png. Local database reports 0014_keyboard_shortcuts at head. The initial manual run was interrupted. The later authorized pre-push harness passed full frontend checks: hooks-test, check, 143 tests, 164 UI cases, production routes and style-studio. Parent packaging remains integration-owned. Logs: /tmp/keyboard-child-push.log and .git/modules/src/frontend/verification-logs/.

# State Ownership

Database is authoritative; AuthProvider holds the shared user snapshot. Keyboard provider derives bindings and owns only pending mutation state. No client persistence or new store.

# Memoization

Retain memoized context value. Two trivial settings rows consume changing context; extra React.memo boundaries offer no useful skipped work.

# Performance Evidence

Focused integration tests passed: zero writes on mount, exactly one save request, durable null reset, failure retention and delayed old-account response rejection. No extra shortcut GET or store was introduced. No latency improvement claimed.

# Page Family

## Family

Settings.

## Reference

SettingsPage General rows and existing KeyboardSettings.

## Shared Rules

Keep existing header, settings-row, key cards and footer Button styling.

## Exceptions

No new visual structure; pending/guest controls become disabled and descriptive copy changes.

## Evidence

Existing General settings header/rows/controls remain unchanged in structure and styling. Live Korean desktop keyboard view verified save/reload/reset with the same composition and simplified copy. Guest edit/reset controls visibly disabled. Screenshot: /tmp/b4react-keyboard-db.png. Mobile/theme matrix not run because the user stopped broader verification.

# Commit Title

feat(auth): connect profile photos to private object storage

# Changed File Scope

Pinned API contract/types, auth API/context, settings and sidebar photo consumers, localized errors, tests and docs.

# Reason

Upload binary images and render authenticated storage photos without embedding originals in account JSON.

# Design

Settings -> AuthProvider -> useAuthApi -> generated transport. One account-owned object URL resolves managed API URLs with bearer auth; preserve external/data legacy images. Session/version guards and URL revocation prevent stale image leakage. Failed upload keeps confirmed user/photo; no automatic retry on storage errors. Reuse existing account photo controls and General peer shell.

# Verification Plan

Root Make verify-plan/verify, request/body/auth tests, image lifecycle and upload-error tests, browser account photo upload/remove/reload/default fallback. Child merge before parent gitlink.

# Impact

Backend photo endpoints required for new edits. Existing legacy photos display as before. No new global store or CSS/layout changes.

# Loop Alignment

API state remains AuthProvider-owned; private blob reads use domain API wrapper. Recovery refetches photo through existing account refresh. No new realtime event/poller. Existing UI composition retained.

# State Ownership

Server owns key/reference; AuthProvider owns canonical user and a separate display object URL scoped to account/version. Settings owns busy/feedback only. Object URLs are revoked on replacement/logout/unmount. No persisted storage URLs or new state library.

# Memoization

No new expensive/repeated rendering boundary: existing sidebar/profile components retained. Stable API hooks and memoized context value avoid incidental churn; no blanket memoization.

# Performance Evidence

Hook tests verify one read per account/version, URL revocation, stale response rejection and recovery retry. Browser assertions verify raw binary upload, authenticated reads, reload and preservation on 503. Consented remembered-account thumbnails downsample blob images without persisting private API references.

# Verification

Full scope selected by make verify-plan; make verify passed: hooks-test, check, 147 unit/integration tests, 165 UI tests, 9 production route tests and 3 style-studio tests. No selected checks omitted. Live cloud writes were not performed; browser transport uses mocked endpoints and backend storage is tested separately.

# Page Family

## Family

Settings account profile.

## Reference

SettingsPage General section and existing Account photo panel.

## Shared Rules

Keep current shell, headers, spacing, photo actions, toast and responsive controls.

## Exceptions

No style/layout exception; transport and loading/error behavior only.

## Evidence

Account upload/read/reload/error/remove browser test passed. Full 165-test UI suite passed including existing Settings family and responsive comparisons. Existing Account/General shell, classes and spacing are unchanged; no shared control or new layout introduced.

# Home previews

Real B4A UI captured in Chromium at 1360 × 900, light theme, English and Korean.
These are illustrative screenshots, not live account or service status.

- components: `/show-case`, the existing shared UI catalogue.
- users: `/admin`, seven fictional example.com accounts and example roles.
- server: `/admin/server`, example connectivity and integration snapshots.
- billing: `/settings?section=billing`, a fictional subscription and test card ending 4242.

Capture uses an isolated browser, mocked `/config` and API routes based on the
admin-panel, admin-server and billing browser test fixtures. External requests are
blocked; no real account, payment, endpoint or token is used. The dummy admin
session exists only in the capture browser. Do not capture a real administrator session.

Set `b4a_language` and `blueprint4fastapi_theme=light`; wait for the actual table,
connection rows or payment card and loaded fonts. Encode PNG captures to WebP
quality 86. Refresh both locales together when source screens materially change.
The service name comes from shared `nav.brand` (B4A).

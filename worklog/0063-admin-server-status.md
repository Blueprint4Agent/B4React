# Commit Title

feat(admin): add server and environment status page

# Changed File Scope

Admin route/API hook, layouts, shared CodeBadge/export/showcase, styles/locales, pinned OpenAPI types, local stack marks, browser/hook tests and page-family documentation.

# Reason

Show actual dependency health and safe effective feature modes in a consistent administrator screen.

# Design

Admin-only read API delegates to a service and bounded concurrent readiness probes. SMTP authentication without email and one Stripe Checkout list read use a per-process 60-second cache and single-flight tasks; API responses wait at most five seconds. Startup evidence is retained separately. Return only safe feature flags plus database/Redis hostname and port, never credentials, database names or options. CodeBadge is shared and showcased for variable names, allowlisted raw values and addresses. The UI reuses the settings/home shell and a full-width PanelCard with aligned values; OAuth icons sit beside the label without a health badge.

# Verification Plan

Run make verify-plan then make verify; exercise authorization, timeout, safe flags, stale recovery and desktop/mobile light/dark peer comparison.

# Impact

Read-only operational visibility. No migrations or feature configuration writes.

# Loop Alignment

Backend request/service/model/error and observation boundaries are followed. No mutation events or Celery jobs apply to read-only probes; ephemeral in-flight network tasks are shared and cleaned up at lifespan shutdown. Frontend uses owner-scoped requests, cancellation, 30-second visible-page polling, focus/network/desktop recovery and stale results after failures or 60 seconds. No domain SSE event exists for external connection changes.

# State Ownership

Page-owned hook stores ephemeral owner-keyed snapshots; server owns health and effective modes. No new global store.

# Memoization

Small status cards are inexpensive; retain existing memoized user table. No blanket memoization.

# Performance Evidence

Hook tests prove one in-flight request during focus/online events, cancellation on owner change/unmount, ignored late responses and snapshot removal on 403. AdminServerPage remains lazy; the existing memoized user table boundary is unchanged. No latency improvement is claimed.

# Verification

Root `make verify-plan` selected backend=True and frontend=full; `make verify` passed. Backend: 253 tests. Frontend: 128 tests, 151 browser UI tests, 9 production route tests and 3 Style Studio browser tests. Architecture, hooks, env/contracts, packaging and project-build checks passed. No selected checks were omitted. Final targeted column comparisons also passed at 390/1440px light/dark. Live read-only smoke reported server/database/cache/email/billing healthy without delivering email or creating a billing resource.

An intermediate parallel browser run lost its shared Vite server; it was discarded and verification was rerun sequentially. A showcase test URL typo was corrected to /show-case before the passing run. No hook was bypassed.

# Page Family

## Family

Settings and home.

## Reference

SettingsPage, HomePage and MainPageTemplate.

## Shared Rules

Reuse settings shell, width, spacing tokens, typography, buttons and responsive layout.

## Exceptions

User table scrolls internally. Environment settings group read-only values into one shared PanelCard for compact comparison; this is a domain-specific content arrangement, while shell width, padding, typography and tokens remain shared.

## Evidence

tests/e2e/admin-server.spec.ts compares actual HomePage, SettingsPage and server-status width/padding/heading font at 390/1440px in light/dark. It checks matching connection/environment widths, aligned value starts, OAuth contrast, colored states, initial spinner, error recovery, permission denial and Redis address. tests/e2e/admin-panel.spec.ts verifies dropdown menu/trigger geometry. Screenshots reviewed from Playwright output; final results below.

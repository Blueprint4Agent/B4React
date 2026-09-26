# Commit Title

fix(api-key): preserve committed results and reconcile realtime state

# Changed File Scope

B4React useApiKeys state hook, SSE connection handling, SettingsPage composition,
status-toggle disabled state and frontend guide/English/Korean README.

# Reason

Redis notification failure must not convert a committed API Key operation into an
HTTP failure. HTTP and SSE arrivals must not duplicate records, and reconnects
must recover changes missed by non-durable Redis pub/sub.

# Design

The parent backend separately owns the bounded best-effort notification policy.
Centralize API Key list/mutation state in a page-owned domain hook, share
ID-based updates, reject stale list responses and reload on SSE connection/tab
activation/desktop recovery. Retain modal/input state in the page.

# Verification Plan

Run root Make static/contract/architecture checks and frontend build. Existing
PR CI tests remain enabled; local/new tests were not requested for this task.

# Impact

API contracts and DB storage stay unchanged. Notifications remain best-effort,
not durable delivery; clients reconcile with authoritative list responses.

# Loop Alignment

Preserve Router-Service-Repository request ownership. Separate committed writes
from UI event transport failures. Domain state hook owns HTTP/SSE reconciliation
and reconnect recovery; feature components remain prop-driven. Worker behavior
and visual composition are unchanged.

# Verification

- make check and make build passed during implementation.
- No local/new tests requested; existing tests remain in required PR CI.
- No live fault injection or browser timing reproduction performed.
- Final parent make check and both repositories git diff --check passed.
- Planned staged governance validation runs before commit.

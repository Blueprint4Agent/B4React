# Pinned B4 API contract

`openapi.json` is the sole input to local API type generation. `source.json` records
its provider repository, immutable source commit, path, and API version.

To adopt a provider contract, copy its reviewed snapshot here, update provenance,
run `make api-generate`, and commit schema, generated types, and consumer changes
together. Run `make check test build` and merge the B4React PR before updating a
backend's submodule pointer. The parent checks semantic equality with its own baseline;
it never overwrites this repository's contract as part of installation or build.

The current behavior baseline is documented at the source commit recorded in
`source.json`, under `contracts/README.md` in B4FastAPI. Providers must preserve
paths, operation IDs, error envelopes/codes, cookie and bearer auth, OAuth redirects,
readiness, and authenticated SSE event payloads. Matching OpenAPI alone does not
prove runtime behavior compatibility. Existing refresh-token and realtime limitations
in that baseline remain unchanged. A shared provider-neutral contract repository can
be introduced when the Spring Boot provider is implemented.

## Admin user directory

`GET /api/v1/auth/admin/users` requires the current database role `admin`, including
for bootstrap identities. Supports `page` (1+), `page_size` (1–100, default 20),
`search` (literal name/email substring, max 200), `role` and `is_active` filters.
Returns newest user IDs first with filtered total and global account counts.
Each user has identity, role, active/verified flags, signup time, login providers
and the latest successful login across linked identities (nullable if never recorded).
Active means account enabled, not currently online. IPs, user agents, passwords,
tokens and provider identifiers are excluded. This read-only snapshot is not a full
login audit/history or live-presence feed. No role changes are exposed through this API.

## Billing foundation

The additive `/api/v1/billing` contract provides bearer-or-application-API-key config, hosted setup
sessions/status and cursor-paginated card/Link lists. `useBillingApi` exposes typed
adapters and known error extraction without automatic requests or cached state.
The billing settings page creates one request UUID per action, reuses it on retry, verifies
`registered` via the status endpoint, and refetches after return/account/connectivity
changes. See [billing UI](../notes/billing.md) for template plans and current limitations.
No Stripe.js dependency is added. The provider remains
the source of truth; no webhook/realtime notification or charge is implied.

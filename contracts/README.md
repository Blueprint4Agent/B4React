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

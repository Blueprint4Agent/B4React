# Commit Title

feat(showcase): preview and apply local style tokens

# Changed File Scope

Development middleware/schema, style studio page and feature, hook/API modules, tests, Make and EN/KO docs.

# Reason

Connect an explicitly enabled local development server to its frontend source, preview showcase style tokens without writes, then apply reviewed changes.

# Design

An opt-in Vite development middleware owns access to its own resolved frontend root and only src/styles/app.css. It validates a bounded token schema, same-origin loopback requests and a per-process capability header; optimistic file hashes reject stale writes. Apply backs up and atomically replaces the file. The showcase exposes a lazy development-only editor; browser drafts override CSS variables only within the showcase and are removed on exit. Light/dark colors and shared geometry are explicit. Production has neither editor code nor middleware. No arbitrary filesystem paths, commands or parent reads are exposed.

# Verification Plan

Make check/test/build; middleware fixtures for opt-in, path boundaries, origin/token guards, validation, backup and stale revision; UI tests for draft/reset/apply/conflict and mobile layout. Production bundle absence check. Root make check test build and required PR CI.

# Impact

Developer opt-in only; persisted changes are normal app.css edits visible in Git and Vite HMR. No auth/API/database schema changes. Parent launch target selects the frontend folder explicitly.

# Loop Alignment

Frontend page -> domain hook -> development API wrapper -> local middleware. No backend request/event/task loops because this is a local Vite tool, no FastAPI endpoints. Preview is local state and applied CSS refresh uses existing HMR; no new SSE or desktop recovery. Shared inputs/buttons/styles reused.

# Verification

Passed make check/test/build (80 Vitest tests, 4 real filesystem/HTTP middleware tests); make test-style-studio (2 mobile/desktop flows), make test-ui (54), make test-routes (6, including editor/protocol absence). Root make check/test/build passed (82 backend tests, 9 initializer fixtures, 80 frontend tests). Live localhost browser confirmed Korean editor and correct source path. Visual inspection at 1440px and overflow assertions at 390/1440px passed. Native packaging was not run because the tool is explicitly browser-dev-only. Required PR CI runs before merge.

# State Ownership

Draft and loaded revision belong to the developer page hook, never global Context or a new store. Draft CSS custom properties belong to the showcase root and are cleaned up on unmount.

# Memoization

Keep high-frequency token input state inside the editor page so the existing expensive showcase catalogue does not rerender on each input. The editor has few cheap controls; no blanket memo wrappers. Verify isolation with a render-count regression test.

# Performance Evidence

Production entry is 390.80 kB / gzip 121.28 kB versus 390.76 / 121.26 baseline. Editor logic, protocol and lazy locale resources are absent from production JS; shared CSS gains style tokens and editor layout. A component render-count test verifies draft input does not rerender a sibling catalogue and unmount removes preview variables. Browser tests verify no write before explicit apply.

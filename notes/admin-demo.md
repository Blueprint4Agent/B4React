# Administrator demo

The backend runtime flag `DEMO_ENABLED` controls `demo_enabled` in `/config` (missing means disabled). Production and development use the same behavior. Visitors can open `/demo/admin` and `/demo/admin/server`; these reuse the administrator pages, table and health cards. Data comes exclusively from the public read-only demo APIs, with anonymized identity fields and real server health. Private admin routes retain role guards.

Filters and pagination remain local; request snapshots are keyed by data source and owner and canceled on navigation. The existing memoized table, desktop connectivity recovery and status refresh loop are reused. Disabling the flag hides entry points and blocks direct routes; the backend also enforces 404. No new global state, mock accounts, write permissions or observability services are introduced.

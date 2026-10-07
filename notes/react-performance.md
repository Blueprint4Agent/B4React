# State ownership and React performance

Decision recorded 2026-09-27 against React 18.3, without React Compiler. Keep the current domain hooks and scoped providers. Do not add Zustand or Redux Toolkit yet. This is a project-specific decision, not a claim that Context is always faster.

## State inventory

| State                       | Current owner and frequency                              | Decision                                                                                                                                  |
| --------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `/config`                   | AppConfigProvider; startup and explicit/recovery refresh | One in-flight request and snapshot; keep Context                                                                                          |
| Identity/session            | AuthProvider; login/logout/revalidation                  | Keep auth lifecycle and credential handling in existing hooks                                                                             |
| Desktop readiness           | ServerConnectivityProvider; reconnect transitions        | Keep one coordinator; avoid mirroring status in another store                                                                             |
| Admin rows/API keys         | Domain API hooks; query/mutation/recovery                | Server state; do not duplicate in a client store                                                                                          |
| Search draft/filter/page    | Page state; frequent typing                              | Keep local; pass stable result rows to memoized table                                                                                     |
| Theme preference            | Per-hook state plus localStorage                         | If simultaneous consumers need synchronized updates, first centralize ownership; a provider or scoped preference store is a future option |
| Sidebar size/expanded state | AppLayout; resize/toggle                                 | Keep local until separate screen consumers need it; persistence writes on pointer moves remain a separate optimization candidate          |
| Recent accounts             | Existing storage utility and event hook                  | Preserve expiry/consent/dedup rules; no second credential/history store                                                                   |

## Library evaluation

| Option                                  | Benefit for this project                                                                                           | Cost / adoption trigger                                                                                                                                                               |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local state + scoped Context (current)  | No new dependency; existing lifecycle and tests                                                                    | Broad Context updates rerender consumers; split ownership before adding a store                                                                                                       |
| Zustand (preferred future client store) | Small hook-oriented store and selector subscriptions for independently changing shared preferences/workspace state | Introduce when distant simultaneous consumers share frequently changing client state and profiling/ownership evidence justifies it; define scoped lifetime, reset and selectors first |
| Redux Toolkit                           | Explicit actions/reducers, tooling and optional RTK Query                                                          | Consider when cross-domain transitions, normalized entities, undo/event debugging or deliberate API-cache replacement warrant the extra conventions                                   |

Zustand supports selector subscriptions; grouped object selections need stable output or `useShallow`. Do not subscribe to the entire store by default. Sources: [Zustand](https://zustand.docs.pmnd.rs/), [useShallow](https://zustand.docs.pmnd.rs/reference/hooks/use-shallow).

Redux's own guidance ties adoption to shared state and update complexity; use Redux Toolkit if Redux is chosen. RTK Query would require an explicit migration of existing request/error/recovery ownership, not a second cache. Sources: [Redux FAQ](https://redux.js.org/faq/general#when-should-i-use-redux), [Why Redux Toolkit](https://redux.js.org/introduction/why-rtk-is-redux-today).

A future store must have typed domain actions/selectors, immutable updates, account-reset behavior, provider/request isolation where needed, and an explicit persistence allowlist. Never persist bootstrap/access tokens or administrator directory data. Keep HTTP in domain API wrappers and invocation in page-owned hooks.

## Default memoization workflow

1. Identify the interaction, changing state, affected subtree and state owner before editing.
2. Keep draft/high-frequency state local; keep API ownership and recovery in existing loops.
3. Use `React.memo` by default for repeated or expensive child boundaries whose props often stay unchanged. Record a concrete reason when it is not useful (trivial render, props always change, or context is the update source).
4. Stabilize arrays/objects/functions crossing that boundary when necessary. Use `useMemo` for costly derivations or stable referenced props, `useCallback` for callbacks whose identity matters. Neither is a blanket requirement for every variable/function.
5. Preserve immutable data, current callback closures and context updates. Do not use deep equality or ignore function props to force memo to pass.
6. Verify both skipped work and necessary updates. Record render/request counts or a production bundle comparison; use React Profiler/browser profiling before claiming user-visible latency gains.

Memo uses shallow prop comparison and does not block a component's own state or Context updates. It is a performance optimization, never a correctness dependency. Source: [React memo](https://react.dev/reference/react/memo).

The first protected boundary is `AdminUserTable`: its parent owns draft input/query/API state; the child receives the original items reference plus boolean loading/error props. The table uses one date formatter per language. Six search keystrokes with ten two-date rows cause zero additional date-format calls. Changed rows, language, loading and error still update. Tests protect observable work rather than wall-clock timings. No custom comparator or callback memoization is needed.

## Enforced harness and its limits

- `make react-performance-check` runs TypeScript-symbol-aware config-owner and protected memo checks, a direct App route-import guard, plus acceptance/rejection fixtures and worklog policy tests. It rejects inline fresh props/spreads on the protected table. Stable-looking identifiers can still conceal allocations; runtime tests and review remain necessary.
- `make check` / `make architecture-check` include that target. Consuming B4FastAPI runs it through `make frontend-architecture-check`.
- Git governance requires **State Ownership**, **Memoization**, **Performance Evidence** in the title-matching worklog for runtime `.ts/.tsx` or package/Vite changes. Test-only and generated files are excluded. Reasons for non-application count; empty placeholders do not. It reads the same staged/committed template and worklog snapshot so older commits retain their old policy. This validates recorded evidence, not whether an optimization is beneficial.
- `make test` covers skipped admin formatting, necessary updates, config deduplication/provider isolation and recovery ordering. `make test-routes` builds and tests actual delayed/failed production chunks. The local full verification job runs production route tests in Chromium.
- Existing `make test-ui` covers layout and authentication/role journeys. Run it for UI changes; no test exemption persists into later work.
- Keep secondary screens lazy. Baseline after splitting: entry JS 390.76 kB (gzip 121.26), down from 426.68 (gzip 130.36). Shared CSS is unchanged. These are observations, not universal budgets or elapsed-time guarantees.

Split independently reviewable optimizations into separate branches/worklogs/PRs. Reassess these rules and measurements when adding a store, changing protected boundaries, upgrading React, or enabling React Compiler. Avoid memo wrappers solely to satisfy a count.

Subscription INVALID_TOKEN recovery delegates to AuthProvider for one fresh config/session recovery and one retry. Concurrent recovery is deduplicated; focus/online reads pause for a rejected token until credentials change. Owner-generation read locks prevent overlapping reloads and obsolete results.

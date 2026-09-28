# Search and pagination

Use the existing `InputField`, `Button` and `Pagination`. The consumer owns query state through `useCollectionQuery`; the domain API hook owns fetching, cancellation, errors, account isolation and desktop/realtime recovery. Do not put HTTP in collection helpers or create a second result store.

## Rules

- Server lists use submitted search by default (Enter or button). Keep draft input separate from the applied query; typing alone must not fetch. Small local catalogues may use immediate search. Debounced remote search requires an explicit product need and stale-request tests.
- Trim the applied search; empty/whitespace means no search. Preserve case and literal `%`/`_` when sending it. Server search fields and case matching belong to the domain. Bound server inputs with `MAX_SEARCH_LENGTH` (200); never silently truncate queries.
- Page numbers start at 1. Shared size defaults to 20, supports 1–100; existing views intentionally use 10 admin rows and 6 API-key/sample rows. Search submission, filter changes and page-size changes reset to page 1. `reset()` clears draft/search/filters/page but retains selected page size. Initial options are mount-time defaults; call setters or remount to change them.
- Use server pagination for growing collections. Local pagination requires the complete collection; never slice a server page or search only its loaded rows and present it as a global search.
- A server response supplies `items`, filtered `total`, `page`, `page_size`; additional domain metadata is allowed. Do not redeclare generated response types. An out-of-range page returns empty items with the requested page and real total; the page owner clamps and refetches after a successful response.
- Unknown/loading total is not zero. Preserve the requested page while fetching; clamp only after receiving a known total. Empty successful results have UI page 1; the pager is hidden when only one page exists.
- Mutations/refetches preserve the current page unless a documented workflow resets it. API keys currently reset when the item count changes; that existing behavior is passed explicitly as `resetKey`. Same-count refreshes retain the page. Use a primitive filter/account key when local collections need explicit resets.
- URL persistence is not automatic. Existing screens keep local query state. Adding deep links requires parsing/validation, back/forward tests and a decision on sensitive search terms.
- Keep fixed card slots, labels, `aria-current` and bounded overflow from the collection UI rules. Domain-specific filters and sort order remain in the domain, including a unique ordering tie-breaker on server lists.

## Server list example

Adapt the existing `AdminPage` pattern with generated query types:

```tsx
const list = useCollectionQuery({ initialFilters: { role: "all" }, pageSize: 10 });
const query = useMemo<AdminUserQuery>(
    () => ({
        page: list.page,
        page_size: list.pageSize,
        search: list.search,
        role: list.filters.role === "admin" ? "admin" : undefined,
    }),
    [list.page, list.pageSize, list.search, list.filters.role],
);
const { data } = useAdminUsers(ownerId, query);
const totalPages = data
    ? getPagination(data.total, list.pageSize, list.page).totalPages
    : Math.max(1, list.page);
useEffect(() => {
    if (data && list.page > totalPages) list.setPage(totalPages);
}, [data, list.page, totalPages, list.setPage]);
```

Wire a search form's submit to `preventDefault()` and `list.submitSearch()`. Connect `InputField` to `list.input`/`list.setInput` with `maxLength={MAX_SEARCH_LENGTH}`. Pass the complete next filter object to `list.setFilters(...)`; pass `list.setPage` to `Pagination.onPageChange`. Maintain the domain hook's memoized query, cancellation and stale-response protection. Draft changes must not change query dependencies.

## Local list example

```tsx
const list = useCollectionQuery({ initialFilters: {}, searchMode: "immediate" });
const filtered = useMemo(
    () =>
        items.filter((item) =>
            item.name.toLocaleLowerCase().includes(list.search.toLocaleLowerCase()),
        ),
    [items, list.search],
);
const pager = useClientPagination(filtered, 6, list.search);
// Render pager.visibleItems; wire pager.page, pager.totalPages and pager.setPage
// to the existing Pagination. The local pager owns its own page; list.page is unused.
```

`useClientPagination` memoizes slices, clamps shrinking collections before committing children and resets on page-size/reset-key changes. Invalid totals/page sizes are programmer errors; `getPagination` throws. Invalid requested pages normalize to 1 and high pages clamp to the last page.

## Existing API-key exception

The current API returns the full key list without a count cap. This predates the bounded-local-list rule. This change preserves its contract and client pagination; migrate to server search/pagination in a separate provider/consumer contract change before treating it as a scalable collection example.

## Verification

`make test` covers draft/submitted/immediate queries, filter/size resets, shrinking/empty lists, explicit resets and metadata boundaries. Existing admin typing tests protect memoized row work; domain hook tests protect stale-account responses and desktop recovery. `make test-ui` covers admin searches/pages and catalogue/API-key behavior at mobile and desktop widths.

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCollectionQuery } from "../../../hooks/collections/useCollectionQuery";
import { useClientPagination } from "../../../hooks/collections/useClientPagination";
import { getPagination } from "../../../utils/collections";

describe("collection query transitions", () => {
    it("keeps drafts separate and resets the page for submitted search, filters and size", () => {
        // Given: a server list on a later page.
        const { result } = renderHook(() =>
            useCollectionQuery({ initialFilters: { role: "all" } }),
        );
        act(() => result.current.setPage(3));
        // When: editing a draft, then submitting it.
        act(() => result.current.setInput("  100%_User  "));
        expect(result.current.search).toBe("");
        expect(result.current.page).toBe(3);
        act(() => result.current.submitSearch());
        // Then: trim without changing case or wildcard characters, and reset pagination.
        expect(result.current.search).toBe("100%_User");
        expect(result.current.page).toBe(1);
        act(() => result.current.setPage(4));
        act(() => result.current.setFilters({ role: "admin" }));
        expect(result.current.page).toBe(1);
        expect(result.current.search).toBe("100%_User");
        act(() => result.current.setPage(2));
        act(() => result.current.setPageSize(10));
        expect(result.current.page).toBe(1);
        expect(result.current.pageSize).toBe(10);
        act(() => result.current.reset());
        expect(result.current.input).toBe("");
        expect(result.current.search).toBe("");
        expect(result.current.filters).toEqual({ role: "all" });
    });

    it("applies local search immediately and clears whitespace-only input", () => {
        // Given: an immediate local collection search.
        const { result } = renderHook(() =>
            useCollectionQuery({ initialFilters: {}, searchMode: "immediate" }),
        );
        // When: typing without submission.
        act(() => result.current.setInput(" Button "));
        // Then: draft is preserved while the applied query is normalized.
        expect(result.current.input).toBe(" Button ");
        expect(result.current.search).toBe("Button");
        act(() => result.current.setInput("   "));
        expect(result.current.search).toBe("");
    });
});

describe("client pagination", () => {
    it("clamps a shrinking list, preserves its page on refresh and resets on explicit keys", () => {
        // Given: a complete local list on its third page.
        const items = Array.from({ length: 13 }, (_, i) => i + 1);
        const { result, rerender } = renderHook(
            ({ rows, key, size }) => useClientPagination(rows, size, key),
            { initialProps: { rows: items, key: "all", size: 6 } },
        );
        act(() => result.current.setPage(3));
        expect(result.current.visibleItems).toEqual([13]);
        // When: the last record disappears, then an equivalent snapshot arrives.
        rerender({ rows: items.slice(0, 12), key: "all", size: 6 });
        expect(result.current.page).toBe(2);
        expect(result.current.visibleItems).toEqual([7, 8, 9, 10, 11, 12]);
        rerender({ rows: [...items], key: "all", size: 6 });
        expect(result.current.page).toBe(2);
        // Then: a filter key or page size change explicitly returns to page one.
        rerender({ rows: items, key: "filtered", size: 6 });
        expect(result.current.page).toBe(1);
        act(() => result.current.setPage(2));
        rerender({ rows: items, key: "filtered", size: 10 });
        expect(result.current.page).toBe(1);
        rerender({ rows: [], key: "filtered", size: 10 });
        expect(result.current.visibleItems).toEqual([]);
        expect(result.current.totalPages).toBe(1);
    });

    it("normalizes invalid page requests and rejects invalid collection metadata", () => {
        // Given / When / Then: boundaries must not create invalid slices or endless ranges.
        expect(getPagination(0, 10, 9)).toEqual({
            page: 1,
            totalPages: 1,
            startIndex: 0,
            endIndex: 0,
        });
        expect(getPagination(13, 6, Infinity).page).toBe(1);
        expect(getPagination(13, 6, -2).page).toBe(1);
        for (const size of [0, -1, 1.5, 101, NaN])
            expect(() => getPagination(13, size, 1)).toThrow(RangeError);
        expect(() => getPagination(-1, 10, 1)).toThrow(RangeError);
    });
});

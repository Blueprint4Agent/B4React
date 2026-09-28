import { useCallback, useState } from "react";
import { DEFAULT_PAGE_SIZE, normalizeSearch, validatePageSize } from "../../utils/collections";

type CollectionQueryOptions<Filters> = {
    initialFilters: Filters;
    pageSize?: number;
    searchMode?: "submit" | "immediate";
};

type CollectionQueryState<Filters> = {
    input: string;
    search: string;
    filters: Filters;
    page: number;
    pageSize: number;
    setInput: (value: string) => void;
    submitSearch: () => void;
    setFilters: (filters: Filters) => void;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
    reset: () => void;
};

/** Local query state only. Domain hooks continue to own HTTP, errors and recovery. */
export function useCollectionQuery<Filters>({
    initialFilters,
    pageSize: initialPageSize = DEFAULT_PAGE_SIZE,
    searchMode = "submit",
}: CollectionQueryOptions<Filters>): CollectionQueryState<Filters> {
    const [defaults] = useState(() => initialFilters);
    const [input, setDraft] = useState("");
    const [query, setQuery] = useState(() => ({
        search: "",
        filters: initialFilters,
        page: 1,
        pageSize: validatePageSize(initialPageSize),
    }));
    function setInput(value: string): void {
        setDraft(value);
        if (searchMode === "immediate") {
            setQuery((previous) => ({ ...previous, search: normalizeSearch(value), page: 1 }));
        }
    }
    function submitSearch(): void {
        setQuery((previous) => ({ ...previous, search: normalizeSearch(input), page: 1 }));
    }
    function setFilters(filters: Filters): void {
        setQuery((previous) => ({ ...previous, filters, page: 1 }));
    }
    const setPage = useCallback((page: number): void => {
        if (!Number.isSafeInteger(page) || page < 1) return;
        setQuery((previous) => (previous.page === page ? previous : { ...previous, page }));
    }, []);
    function setPageSize(pageSize: number): void {
        validatePageSize(pageSize);
        setQuery((previous) => ({ ...previous, pageSize, page: 1 }));
    }
    function reset(): void {
        setDraft("");
        setQuery((previous) => ({ ...previous, search: "", filters: defaults, page: 1 }));
    }
    return { ...query, input, setInput, submitSearch, setFilters, setPage, setPageSize, reset };
}

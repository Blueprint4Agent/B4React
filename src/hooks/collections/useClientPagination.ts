import { useMemo, useState } from "react";
import { getPagination, type PaginationState } from "../../utils/collections";

/** Use only with a complete local collection, never a server-returned page. */
export function useClientPagination<Item>(
    items: readonly Item[],
    pageSize: number,
    resetKey?: string | number,
): PaginationState & { visibleItems: Item[]; setPage: (page: number) => void } {
    const [state, setState] = useState({ page: 1, resetKey, pageSize });
    const requestedPage =
        Object.is(state.resetKey, resetKey) && state.pageSize === pageSize ? state.page : 1;
    const pagination = getPagination(items.length, pageSize, requestedPage);
    // Reconcile before committing children, so a shortened collection never flashes an empty page.
    if (
        state.page !== pagination.page ||
        !Object.is(state.resetKey, resetKey) ||
        state.pageSize !== pageSize
    ) {
        setState({ page: pagination.page, resetKey, pageSize });
    }
    const visibleItems = useMemo(
        () => items.slice(pagination.startIndex, pagination.endIndex),
        [items, pagination.startIndex, pagination.endIndex],
    );
    function setPage(page: number): void {
        setState({ page: getPagination(items.length, pageSize, page).page, resetKey, pageSize });
    }
    return { ...pagination, visibleItems, setPage };
}

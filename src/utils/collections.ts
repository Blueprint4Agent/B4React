/** Server query limits mirror the pinned list contract; sizes remain view-specific. */
export const MAX_SEARCH_LENGTH = 200;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function normalizeSearch(value: string): string {
    return value.trim();
}

export function validatePageSize(pageSize: number): number {
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
        throw new RangeError(`pageSize must be an integer between 1 and ${MAX_PAGE_SIZE}`);
    }
    return pageSize;
}

export type PaginationState = {
    page: number;
    totalPages: number;
    startIndex: number;
    endIndex: number;
};

/** Pass a known total only: an in-flight server response is not an empty list. */
export function getPagination(total: number, pageSize: number, page: number): PaginationState {
    validatePageSize(pageSize);
    if (!Number.isSafeInteger(total) || total < 0) {
        throw new RangeError("total must be a nonnegative safe integer");
    }
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(totalPages, Math.max(1, Number.isSafeInteger(page) ? page : 1));
    const startIndex = (currentPage - 1) * pageSize;
    return {
        page: currentPage,
        totalPages,
        startIndex,
        endIndex: Math.min(total, startIndex + pageSize),
    };
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export interface SanitizedPagination {
  page: number;
  pageSize: number;
  offset: number;
  limit: number;
}

function parsePositiveInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed) || parsed <= 0) {
    return undefined;
  }
  return parsed;
}

function parseNonNegativeInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed) || parsed < 0) {
    return undefined;
  }
  return parsed;
}

export function parsePaginationParams(searchParams: URLSearchParams): SanitizedPagination {
  const rawPage = searchParams.get("page");
  const rawPageSize = searchParams.get("page_size") ?? searchParams.get("limit");
  const rawOffset = searchParams.get("offset");

  let pageSize = parsePositiveInt(rawPageSize) ?? DEFAULT_PAGE_SIZE;
  pageSize = Math.max(1, Math.min(pageSize, MAX_PAGE_SIZE));

  let page = parsePositiveInt(rawPage) ?? DEFAULT_PAGE;

  if (!rawPage) {
    const offset = parseNonNegativeInt(rawOffset);
    if (typeof offset === "number") {
      page = Math.floor(offset / pageSize) + 1;
    }
  }

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
    limit: pageSize,
  };
}

export function paginateArray<T>(items: readonly T[], page: number, pageSize: number) {
  const total = items.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const data = items.slice(start, start + pageSize);

  return { data, total, totalPages };
}

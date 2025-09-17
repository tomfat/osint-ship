import { describe, expect, it } from "vitest";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, paginateArray, parsePaginationParams } from "./pagination";

const buildSearchParams = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }
  return searchParams;
};

describe("parsePaginationParams", () => {
  it("returns defaults when parameters are missing", () => {
    const params = parsePaginationParams(new URLSearchParams());

    expect(params.page).toBe(1);
    expect(params.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(params.offset).toBe(0);
    expect(params.limit).toBe(DEFAULT_PAGE_SIZE);
  });

  it("parses explicit page and page size values", () => {
    const params = parsePaginationParams(buildSearchParams({ page: 3, page_size: 15 }));

    expect(params.page).toBe(3);
    expect(params.pageSize).toBe(15);
    expect(params.offset).toBe(30);
    expect(params.limit).toBe(15);
  });

  it("clamps page size to the configured maximum", () => {
    const params = parsePaginationParams(buildSearchParams({ page_size: MAX_PAGE_SIZE + 50 }));

    expect(params.pageSize).toBe(MAX_PAGE_SIZE);
  });

  it("falls back to defaults when provided values are invalid", () => {
    const params = parsePaginationParams(buildSearchParams({ page: "-2", page_size: "not-a-number" }));

    expect(params.page).toBe(1);
    expect(params.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(params.offset).toBe(0);
  });

  it("derives the page from offset and limit when page is not provided", () => {
    const params = parsePaginationParams(buildSearchParams({ limit: 25, offset: 50 }));

    expect(params.pageSize).toBe(25);
    expect(params.page).toBe(3);
    expect(params.offset).toBe(50);
  });

  it("rounds down offset based calculations", () => {
    const params = parsePaginationParams(buildSearchParams({ limit: 7, offset: 17 }));

    expect(params.pageSize).toBe(7);
    expect(params.page).toBe(3);
    expect(params.offset).toBe(14);
  });

  it("ignores negative offsets", () => {
    const params = parsePaginationParams(buildSearchParams({ limit: 10, offset: -30 }));

    expect(params.page).toBe(1);
    expect(params.offset).toBe(0);
  });
});

describe("paginateArray", () => {
  const sample = Array.from({ length: 25 }, (_, index) => index + 1);

  it("returns the requested slice for a middle page", () => {
    const { data, total, totalPages } = paginateArray(sample, 2, 10);

    expect(data).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(total).toBe(25);
    expect(totalPages).toBe(3);
  });

  it("returns only remaining items on the last page", () => {
    const { data, total, totalPages } = paginateArray(sample, 3, 10);

    expect(data).toEqual([21, 22, 23, 24, 25]);
    expect(total).toBe(25);
    expect(totalPages).toBe(3);
  });

  it("returns an empty array when the page is beyond the data set", () => {
    const { data, total, totalPages } = paginateArray(sample, 5, 10);

    expect(data).toEqual([]);
    expect(total).toBe(25);
    expect(totalPages).toBe(3);
  });

  it("handles empty collections", () => {
    const { data, total, totalPages } = paginateArray([], 1, 10);

    expect(data).toEqual([]);
    expect(total).toBe(0);
    expect(totalPages).toBe(0);
  });
});

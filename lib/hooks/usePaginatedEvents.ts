"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ConfidenceLevel, EventRecord } from "@/lib/types";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/pagination";

interface UsePaginatedEventsOptions {
  pageSize?: number;
  vesselId?: string;
  confidence?: ConfidenceLevel;
  startDate?: string;
  endDate?: string;
}

interface PaginatedEventResponse {
  data: EventRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
}

const clampPage = (value: number) => {
  if (!Number.isFinite(value) || Number.isNaN(value) || value < 1) {
    return 1;
  }
  return Math.floor(value);
};

const clampPageSize = (value: number) => {
  if (!Number.isFinite(value) || Number.isNaN(value) || value <= 0) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.min(Math.floor(value), MAX_PAGE_SIZE);
};

export function usePaginatedEvents(options: UsePaginatedEventsOptions) {
  const { pageSize: initialPageSize = DEFAULT_PAGE_SIZE, vesselId, confidence, startDate, endDate } = options;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(() => clampPageSize(initialPageSize));
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = useMemo(() => `${vesselId ?? ""}|${confidence ?? ""}|${startDate ?? ""}|${endDate ?? ""}`, [
    vesselId,
    confidence,
    startDate,
    endDate,
  ]);
  const previousFiltersRef = useRef(filtersKey);

  useEffect(() => {
    if (previousFiltersRef.current !== filtersKey) {
      previousFiltersRef.current = filtersKey;
      setPage(1);
    }
  }, [filtersKey]);

  useEffect(() => {
    setPageSizeState(clampPageSize(initialPageSize));
  }, [initialPageSize]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("page_size", String(pageSize));
    if (vesselId) {
      params.set("vessel", vesselId);
    }
    if (confidence) {
      params.set("confidence", confidence);
    }
    if (startDate) {
      params.set("start_date", startDate);
    }
    if (endDate) {
      params.set("end_date", endDate);
    }

    async function fetchEvents() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/events?${params.toString()}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to load events (status ${response.status})`);
        }
        const payload: PaginatedEventResponse = await response.json();
        setEvents(payload.data);
        setTotal(payload.total);
        setTotalPages(
          typeof payload.totalPages === "number"
            ? payload.totalPages
            : payload.total === 0
              ? 0
              : Math.ceil(payload.total / payload.pageSize),
        );
        if (payload.page !== page) {
          setPage(payload.page);
        }
        if (payload.pageSize !== pageSize) {
          setPageSizeState(clampPageSize(payload.pageSize));
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          return;
        }
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();

    return () => {
      controller.abort();
    };
  }, [page, pageSize, vesselId, confidence, startDate, endDate]);

  const goToPage = useCallback((value: number) => {
    setPage((current) => {
      const next = clampPage(value);
      return current === next ? current : next;
    });
  }, []);

  const updatePageSize = useCallback((value: number) => {
    const next = clampPageSize(value);
    setPageSizeState((current) => (current === next ? current : next));
    setPage(1);
  }, []);

  return {
    data: events,
    page,
    pageSize,
    total,
    totalPages,
    isLoading,
    error,
    setPage: goToPage,
    setPageSize: updatePageSize,
  };
}

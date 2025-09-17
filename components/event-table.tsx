"use client";

import { useMemo } from "react";
import { Vessel } from "@/lib/types";
import { ConfidenceBadge } from "./confidence-badge";
import { formatDateRange } from "@/lib/utils";
import { usePaginatedEvents } from "@/lib/hooks/usePaginatedEvents";

interface EventTableProps {
  vessels: Vessel[];
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function EventTable({ vessels }: EventTableProps) {
  const { data: events, page, pageSize, total, totalPages, isLoading, error, setPage, setPageSize } =
    usePaginatedEvents({ pageSize: PAGE_SIZE_OPTIONS[0] });

  const vesselLookup = useMemo(() => new Map(vessels.map((vessel) => [vessel.id, vessel])), [vessels]);

  const hasNextPage = totalPages > 0 && page < totalPages;
  const hasPreviousPage = page > 1 && total > 0;
  const firstItemIndex = events.length > 0 ? (page - 1) * pageSize + 1 : 0;
  const lastItemIndex = events.length > 0 ? firstItemIndex + events.length - 1 : 0;
  const currentPageDisplay = totalPages === 0 ? 1 : page;
  const totalPagesDisplay = totalPages === 0 ? 1 : totalPages;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Event History</h2>
          <p className="text-sm text-slate-400">
            Browse curated movements and analyst notes. Adjust the page size to review more results at once.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <span className="text-xs uppercase tracking-wide text-slate-500">Rows per page</span>
          <select
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2"
            value={pageSize}
            onChange={(event) => setPageSize(Number.parseInt(event.target.value, 10))}
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
          <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Vessel</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Confidence</th>
              <th className="px-4 py-3">Evidence</th>
              <th className="px-4 py-3">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {events.map((event) => {
              const vessel = vesselLookup.get(event.vesselId);
              return (
                <tr key={event.id} className="hover:bg-slate-900/50">
                  <td className="px-4 py-3 text-white">
                    <div className="flex flex-col">
                      <span className="font-medium">{vessel?.name ?? "Unknown"}</span>
                      <span className="text-xs text-slate-500">{vessel?.hullNumber ?? "--"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDateRange(event)}</td>
                  <td className="px-4 py-3">{event.location.locationName}</td>
                  <td className="px-4 py-3">
                    <ConfidenceBadge level={event.confidence} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{event.evidenceType}</td>
                  <td className="px-4 py-3 text-xs">
                    <a href={event.sourceUrl} className="text-navy-200 hover:text-navy-100" target="_blank" rel="noreferrer">
                      Source ↗
                    </a>
                  </td>
                </tr>
              );
            })}
            {!isLoading && !error && events.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  No events matched the selected filters.
                </td>
              </tr>
            )}
            {!isLoading && error && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-red-400">
                  {error}
                </td>
              </tr>
            )}
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  Loading events...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-400">
          {events.length > 0 ? (
            <span>
              Showing <span className="text-white">{firstItemIndex}</span>-<span className="text-white">{lastItemIndex}</span> of{' '}
              <span className="text-white">{total}</span> events
            </span>
          ) : error ? (
            <span className="text-red-400">{error}</span>
          ) : isLoading ? (
            <span>Loading events...</span>
          ) : (
            <span>No events found.</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-600"
            onClick={() => setPage(page - 1)}
            disabled={!hasPreviousPage || isLoading}
          >
            Previous
          </button>
          <span className="text-sm text-slate-400">
            Page <span className="text-white">{currentPageDisplay}</span> of{' '}
            <span className="text-white">{totalPagesDisplay}</span>
          </span>
          <button
            type="button"
            className="rounded border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-600"
            onClick={() => setPage(page + 1)}
            disabled={!hasNextPage || isLoading}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

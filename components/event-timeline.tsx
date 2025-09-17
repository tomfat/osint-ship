"use client";

import { useMemo } from "react";
import { ConfidenceBadge } from "./confidence-badge";
import { formatDateRange } from "@/lib/utils";
import { ConfidenceLevel, Vessel } from "@/lib/types";
import { usePaginatedEvents } from "@/lib/hooks/usePaginatedEvents";

interface EventTimelineProps {
  vessels: Vessel[];
  vesselId?: string;
  confidence?: ConfidenceLevel;
  pageSize?: number;
}

export function EventTimeline({ vessels, vesselId, confidence, pageSize = 5 }: EventTimelineProps) {
  const { data: events, page, totalPages, total, isLoading, error, setPage } = usePaginatedEvents({
    pageSize,
    vesselId,
    confidence,
  });

  const vesselLookup = useMemo(() => new Map(vessels.map((vessel) => [vessel.id, vessel])), [vessels]);
  const currentPageDisplay = totalPages === 0 ? 1 : page;
  const totalPagesDisplay = totalPages === 0 ? 1 : totalPages;
  const hasPreviousPage = page > 1 && total > 0;
  const hasNextPage = totalPages > 0 && page < totalPages;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/80 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Event Timeline</h2>
          <p className="mt-1 text-sm text-slate-400">
            Sorted chronologically with the newest verified events first. Use the controls to navigate historical records.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>
            Page <span className="text-white">{currentPageDisplay}</span> of{' '}
            <span className="text-white">{totalPagesDisplay}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-600"
              onClick={() => setPage(page - 1)}
              disabled={!hasPreviousPage || isLoading}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-600"
              onClick={() => setPage(page + 1)}
              disabled={!hasNextPage || isLoading}
            >
              Next
            </button>
          </div>
        </div>
      </header>
      <ol className="mt-6 space-y-5">
        {events.map((event) => {
          const vessel = vesselLookup.get(event.vesselId);
          return (
            <li key={event.id} className="grid gap-2 rounded-lg border border-slate-800 bg-slate-900/40 p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {vessel?.name ?? "Unknown Vessel"}
                    <span className="ml-2 text-xs uppercase tracking-wide text-slate-500">{vessel?.hullNumber}</span>
                  </p>
                  <p className="text-xs text-slate-400">{formatDateRange(event)}</p>
                </div>
                <ConfidenceBadge level={event.confidence} />
              </div>
              <p className="text-sm text-slate-300">{event.summary}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span>Location: {event.location.locationName}</span>
                <span>Evidence: {event.evidenceType}</span>
                <span>Last verified: {new Date(event.lastVerifiedAt).toLocaleString()}</span>
                <a href={event.sourceUrl} className="text-navy-200 hover:text-navy-100" target="_blank" rel="noreferrer">
                  Source ↗
                </a>
              </div>
            </li>
          );
        })}
        {!isLoading && !error && events.length === 0 && (
          <li className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
            No events available for the current filters.
          </li>
        )}
        {!isLoading && error && (
          <li className="rounded-lg border border-red-900/40 bg-red-900/10 p-6 text-center text-sm text-red-300">
            {error}
          </li>
        )}
        {isLoading && (
          <li className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
            Loading timeline...
          </li>
        )}
      </ol>
    </section>
  );
}

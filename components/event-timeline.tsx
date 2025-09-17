import type { ReactNode } from "react";
import { EventRecord, Vessel } from "@/lib/types";
import { ConfidenceBadge } from "./confidence-badge";
import { formatDateRange } from "@/lib/utils";
import type { TimeRange } from "./time-range-controls";

interface EventTimelineProps {
  events: EventRecord[];
  vessels: Vessel[];
  timeRange?: TimeRange;
  isLoading?: boolean;
  error?: string | null;
}

function formatSelectedRange(range?: TimeRange): string | null {
  if (!range || (!range.startDate && !range.endDate)) {
    return null;
  }

  const format = (value: string) =>
    new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const startLabel = range.startDate ? format(range.startDate) : "—";
  const endLabel = range.endDate ? format(range.endDate) : "—";

  return `${startLabel} – ${endLabel}`;
}

export function EventTimeline({ events, vessels, timeRange, isLoading, error }: EventTimelineProps) {
  const rangeLabel = formatSelectedRange(timeRange);

  let timelineContent: ReactNode;

  if (isLoading) {
    timelineContent = (
      <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-300">
        Loading events for the selected filters…
      </div>
    );
  } else if (error) {
    timelineContent = (
      <div className="mt-6 rounded-lg border border-rose-900/60 bg-rose-950/40 p-6 text-sm text-rose-200">
        {error}
      </div>
    );
  } else if (events.length === 0) {
    timelineContent = (
      <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-300">
        <p>No events matched the current filters.</p>
        {rangeLabel ? <p className="mt-2 text-xs text-slate-500">Time window: {rangeLabel}</p> : null}
      </div>
    );
  } else {
    timelineContent = (
      <ol className="mt-6 space-y-5">
        {events.map((event) => {
          const vessel = vessels.find((v) => v.id === event.vesselId);
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
      </ol>
    );
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/80 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Event Timeline</h2>
          <p className="mt-1 text-sm text-slate-400">
            Sorted chronologically with the newest verified events first. Click through to review sourcing details before
            publication.
          </p>
          {rangeLabel ? <p className="mt-2 text-xs text-slate-500">Active range: {rangeLabel}</p> : null}
        </div>
      </header>
      {timelineContent}
    </section>
  );
}

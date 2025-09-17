import Link from "next/link";

import { EventRecord, Vessel } from "@/lib/types";
import { ConfidenceBadge } from "./confidence-badge";
import { formatDateRange } from "@/lib/utils";

interface EventTimelineProps {
  events: EventRecord[];
  vessels: Vessel[];
}

export function EventTimeline({ events, vessels }: EventTimelineProps) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/80 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Event Timeline</h2>
          <p className="mt-1 text-sm text-slate-400">
            Sorted chronologically with the newest verified events first. Click through to review sourcing details before
            publication.
          </p>
        </div>
      </header>
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
                <Link href={`/events/${event.id}`} className="text-navy-200 hover:text-navy-100">
                  View details →
                </Link>
                <a href={event.sourceUrl} className="text-navy-200 hover:text-navy-100" target="_blank" rel="noreferrer">
                  Source ↗
                </a>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

import { EventRecord, Vessel } from "@/lib/types";
import { ConfidenceBadge } from "./confidence-badge";
import { formatDateRange } from "@/lib/utils";

interface EventTableProps {
  events: EventRecord[];
  vessels: Vessel[];
}

export function EventTable({ events, vessels }: EventTableProps) {
  const vesselLookup = new Map(vessels.map((vessel) => [vessel.id, vessel]));

  return (
    <div className="overflow-x-auto">
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
        </tbody>
      </table>
    </div>
  );
}

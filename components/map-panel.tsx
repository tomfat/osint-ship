import { EventRecord, Vessel } from "@/lib/types";
import { ConfidenceBadge } from "./confidence-badge";
import { formatDateRange, getLatestEventsByVessel } from "@/lib/utils";

interface MapPanelProps {
  vessels: Vessel[];
  events: EventRecord[];
  selectedVesselId?: string;
}

export function MapPanel({ vessels, events, selectedVesselId }: MapPanelProps) {
  const latestByVessel = getLatestEventsByVessel(events);
  const displayVessels = selectedVesselId ? vessels.filter((v) => v.id === selectedVesselId) : vessels;

  return (
    <section className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Last Known Positions</h2>
          <p className="mt-1 text-sm text-slate-400">
            Interactive map placeholder. Integrate Mapbox GL JS or React Leaflet to visualize live vessel markers in future
            iterations.
          </p>
        </div>
        <div className="rounded border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-400">
          Map Integration Planned
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayVessels.map((vessel) => {
          const latest = latestByVessel[vessel.id];
          if (!latest) {
            return (
              <article
                key={vessel.id}
                className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400"
              >
                <h3 className="text-base font-semibold text-white">{vessel.name}</h3>
                <p className="text-xs uppercase tracking-wide text-slate-500">{vessel.hullNumber}</p>
                <p className="mt-3 text-slate-500">No verified events yet.</p>
              </article>
            );
          }

          return (
            <article key={vessel.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">{vessel.name}</h3>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{vessel.hullNumber}</p>
                </div>
                <ConfidenceBadge level={latest.confidence} />
              </div>
              <p className="mt-3 text-sm text-slate-300">{latest.location.locationName}</p>
              <p className="mt-1 text-xs text-slate-500">{formatDateRange(latest)}</p>
              <p className="mt-3 text-xs text-slate-400">{latest.summary}</p>
              <a
                href={latest.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs text-navy-200 hover:text-navy-100"
              >
                View source ↗
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}

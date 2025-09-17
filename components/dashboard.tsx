"use client";

import { useMemo, useState } from "react";
import { EventRecord, FleetStatistics, Vessel, ConfidenceLevel } from "@/lib/types";
import { MapPanel } from "./map-panel";
import { EventTimeline } from "./event-timeline";
import { MetricCard } from "./metric-card";
import { getVesselEvents } from "@/lib/utils";

interface DashboardProps {
  vessels: Vessel[];
  events: EventRecord[];
  stats: FleetStatistics;
}

const confidenceOptions: (ConfidenceLevel | "All")[] = ["All", "High", "Medium", "Low"];

export function Dashboard({ vessels, events, stats }: DashboardProps) {
  const [selectedVesselId, setSelectedVesselId] = useState<string | "All">("All");
  const [selectedConfidence, setSelectedConfidence] = useState<ConfidenceLevel | "All">("All");

  const vesselFilter = selectedVesselId === "All" ? undefined : selectedVesselId;
  const confidenceFilter = selectedConfidence === "All" ? undefined : selectedConfidence;

  const filteredEvents = useMemo(() => {
    const vesselFiltered = getVesselEvents(events, vesselFilter);
    if (!confidenceFilter) {
      return vesselFiltered;
    }
    return vesselFiltered.filter((event) => event.confidence === confidenceFilter);
  }, [events, vesselFilter, confidenceFilter]);

  const sortedEvents = useMemo(
    () =>
      [...filteredEvents].sort(
        (a, b) => new Date(b.lastVerifiedAt).getTime() - new Date(a.lastVerifiedAt).getTime(),
      ),
    [filteredEvents],
  );

  return (
    <div className="space-y-10">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Carriers tracked" value={stats.totalVessels} description="Active vessels in watchlist" />
        <MetricCard
          title="Recent updates"
          value={stats.eventsLast30Days}
          description="Events verified during the last 30 days"
        />
        <MetricCard
          title="Deployments underway"
          value={stats.activeDeployments}
          description="Carriers currently reported at sea"
        />
        <MetricCard
          title="Needs review"
          value={stats.vesselsMissingUpdates}
          description="Vessels with aging intelligence (>14 days)"
        />
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950/80 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Filter intelligence feed</h2>
            <p className="mt-1 text-sm text-slate-400">
              Narrow events by hull or confidence rating to review recent movements and sourcing quality.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-300">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wide text-slate-500">Vessel</span>
              <select
                className="rounded border border-slate-700 bg-slate-900 px-3 py-2"
                value={selectedVesselId}
                onChange={(event) => setSelectedVesselId(event.target.value)}
              >
                <option value="All">All vessels</option>
                {vessels.map((vessel) => (
                  <option key={vessel.id} value={vessel.id}>
                    {vessel.name} ({vessel.hullNumber})
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wide text-slate-500">Confidence</span>
              <select
                className="rounded border border-slate-700 bg-slate-900 px-3 py-2"
                value={selectedConfidence}
                onChange={(event) => setSelectedConfidence(event.target.value as ConfidenceLevel | "All")}
              >
                {confidenceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      <MapPanel
        vessels={vessels}
        events={sortedEvents}
        selectedVesselId={selectedVesselId === "All" ? undefined : selectedVesselId}
      />

      <EventTimeline vessels={vessels} vesselId={vesselFilter} confidence={confidenceFilter} />
    </div>
  );
}

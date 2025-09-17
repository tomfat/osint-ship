"use client";

import { useEffect, useMemo, useState } from "react";
import { EventRecord, FleetStatistics, Vessel, ConfidenceLevel } from "@/lib/types";
import { MapPanel } from "./map-panel";
import { EventTimeline } from "./event-timeline";
import { MetricCard } from "./metric-card";
import { TimeRangeControls, type TimeRange } from "./time-range-controls";
import { getVesselEvents } from "@/lib/utils";

interface DashboardProps {
  vessels: Vessel[];
  events: EventRecord[];
  stats: FleetStatistics;
}

const confidenceOptions: (ConfidenceLevel | "All")[] = ["All", "High", "Medium", "Low"];

interface DateBounds {
  hasData: boolean;
  minDate?: string;
  maxDate?: string;
}

function deriveDateBounds(records: EventRecord[]): DateBounds {
  if (records.length === 0) {
    return { hasData: false };
  }

  let minTime = Number.POSITIVE_INFINITY;
  let maxTime = Number.NEGATIVE_INFINITY;

  for (const record of records) {
    const startTime = new Date(record.eventDate.start).getTime();
    const endTime = record.eventDate.end ? new Date(record.eventDate.end).getTime() : startTime;
    if (startTime < minTime) {
      minTime = startTime;
    }
    if (endTime > maxTime) {
      maxTime = endTime;
    }
  }

  return {
    hasData: true,
    minDate: new Date(minTime).toISOString().slice(0, 10),
    maxDate: new Date(maxTime).toISOString().slice(0, 10),
  };
}

function clampRangeToBounds(range: TimeRange, bounds: DateBounds): TimeRange {
  if (!bounds.hasData || !bounds.minDate || !bounds.maxDate) {
    return { startDate: undefined, endDate: undefined };
  }

  let start = range.startDate ?? bounds.minDate;
  let end = range.endDate ?? bounds.maxDate;

  if (start < bounds.minDate) {
    start = bounds.minDate;
  }
  if (start > bounds.maxDate) {
    start = bounds.maxDate;
  }

  if (end > bounds.maxDate) {
    end = bounds.maxDate;
  }
  if (end < bounds.minDate) {
    end = bounds.minDate;
  }

  if (start > end) {
    start = end;
  }

  return { startDate: start, endDate: end };
}

export function Dashboard({ vessels, events, stats }: DashboardProps) {
  const [selectedVesselId, setSelectedVesselId] = useState<string | "All">("All");
  const [selectedConfidence, setSelectedConfidence] = useState<ConfidenceLevel | "All">("All");

  const dateBounds = useMemo(() => deriveDateBounds(events), [events]);

  const [dateRange, setDateRange] = useState<TimeRange>(() =>
    dateBounds.hasData && dateBounds.minDate && dateBounds.maxDate
      ? { startDate: dateBounds.minDate, endDate: dateBounds.maxDate }
      : { startDate: undefined, endDate: undefined },
  );

  useEffect(() => {
    if (!dateBounds.hasData || !dateBounds.minDate || !dateBounds.maxDate) {
      setDateRange((previous) => {
        if (!previous.startDate && !previous.endDate) {
          return previous;
        }
        return { startDate: undefined, endDate: undefined };
      });
      return;
    }

    setDateRange((previous) => {
      const nextRange = clampRangeToBounds(
        {
          startDate: previous.startDate ?? dateBounds.minDate,
          endDate: previous.endDate ?? dateBounds.maxDate,
        },
        dateBounds,
      );

      if (nextRange.startDate === previous.startDate && nextRange.endDate === previous.endDate) {
        return previous;
      }

      return nextRange;
    });
  }, [dateBounds.hasData, dateBounds.maxDate, dateBounds.minDate]);

  const handleRangeChange = (range: TimeRange) => {
    if (!dateBounds.hasData) {
      return;
    }

    const normalized = clampRangeToBounds(range, dateBounds);
    setDateRange((previous) => {
      if (previous.startDate === normalized.startDate && previous.endDate === normalized.endDate) {
        return previous;
      }
      return normalized;
    });
  };

  const [remoteEvents, setRemoteEvents] = useState<EventRecord[]>(events);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  useEffect(() => {
    setRemoteEvents(events);
  }, [events]);

  useEffect(() => {
    if (!dateBounds.hasData || !dateRange.startDate || !dateRange.endDate) {
      setRemoteEvents([]);
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams();

    if (selectedVesselId !== "All") {
      params.set("vessel", selectedVesselId);
    }
    if (selectedConfidence !== "All") {
      params.set("confidence", selectedConfidence);
    }
    params.set("start_date", dateRange.startDate);
    params.set("end_date", dateRange.endDate);

    const query = params.toString();

    setIsLoadingEvents(true);
    setEventsError(null);

    fetch(`/api/events${query ? `?${query}` : ""}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${response.status}`);
        }
        return response.json() as Promise<{ data?: EventRecord[] }>;
      })
      .then((payload) => {
        if (Array.isArray(payload.data)) {
          setRemoteEvents(payload.data);
        } else {
          setRemoteEvents([]);
        }
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        setEventsError("Unable to load events for the selected filters.");
        setRemoteEvents([]);
      })
      .finally(() => {
        setIsLoadingEvents(false);
      });

    return () => {
      controller.abort();
    };
  }, [dateBounds.hasData, dateRange.endDate, dateRange.startDate, selectedConfidence, selectedVesselId]);

  const filteredEvents = useMemo(() => {
    const vesselFiltered = getVesselEvents(remoteEvents, {
      vesselId: selectedVesselId === "All" ? undefined : selectedVesselId,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
    if (selectedConfidence === "All") {
      return vesselFiltered;
    }
    return vesselFiltered.filter((event) => event.confidence === selectedConfidence);
  }, [remoteEvents, selectedConfidence, selectedVesselId, dateRange.endDate, dateRange.startDate]);

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
          <div className="flex flex-wrap items-end gap-4 text-sm text-slate-300">
            <TimeRangeControls
              minDate={dateBounds.minDate}
              maxDate={dateBounds.maxDate}
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onRangeChange={handleRangeChange}
            />
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

      <EventTimeline
        events={sortedEvents}
        vessels={vessels}
        timeRange={dateRange}
        isLoading={isLoadingEvents}
        error={eventsError}
      />
    </div>
  );
}

import { EventRecord, FleetStatistics, Vessel } from "./types";

export function getLatestEventsByVessel(events: EventRecord[]): Record<string, EventRecord> {
  return events.reduce<Record<string, EventRecord>>((acc, event) => {
    const existing = acc[event.vesselId];
    if (!existing) {
      acc[event.vesselId] = event;
      return acc;
    }

    const existingDate = new Date(existing.lastVerifiedAt).getTime();
    const currentDate = new Date(event.lastVerifiedAt).getTime();
    if (currentDate > existingDate) {
      acc[event.vesselId] = event;
    }
    return acc;
  }, {});
}

export function getVesselEvents(events: EventRecord[], vesselId?: string): EventRecord[] {
  if (!vesselId) {
    return events;
  }
  return events.filter((event) => event.vesselId === vesselId);
}

export function formatDateRange(event: EventRecord): string {
  const start = new Date(event.eventDate.start).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  if (!event.eventDate.end) {
    return start;
  }

  const end = new Date(event.eventDate.end).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return `${start} – ${end}`;
}

export function calculateFleetStatistics(
  vessels: Vessel[],
  events: EventRecord[],
  referenceDate: Date = new Date(),
): FleetStatistics {
  const now = referenceDate.getTime();
  const thirtyDaysInMs = 1000 * 60 * 60 * 24 * 30;
  const fourteenDaysInMs = 1000 * 60 * 60 * 24 * 14;

  const eventsLast30Days = events.filter((event) => {
    const lastVerified = new Date(event.lastVerifiedAt).getTime();
    return now - lastVerified <= thirtyDaysInMs;
  }).length;

  const latestEventsByVessel = getLatestEventsByVessel(events);

  const activeDeployments = Object.values(latestEventsByVessel).filter((event) => {
    const lastVerified = new Date(event.lastVerifiedAt).getTime();
    const isRecent = now - lastVerified <= thirtyDaysInMs;
    const deploymentEnd = event.eventDate.end ? new Date(event.eventDate.end).getTime() : undefined;
    const isOngoing = deploymentEnd === undefined || deploymentEnd >= now;
    return isRecent && isOngoing;
  }).length;

  const vesselsMissingUpdates = vessels.filter((vessel) => {
    const latestEvent = latestEventsByVessel[vessel.id];
    if (!latestEvent) {
      return true;
    }
    const lastVerified = new Date(latestEvent.lastVerifiedAt).getTime();
    return now - lastVerified > fourteenDaysInMs;
  }).length;

  return {
    totalVessels: vessels.length,
    activeDeployments,
    eventsLast30Days,
    vesselsMissingUpdates,
    generatedAt: referenceDate.toISOString(),
  };
}

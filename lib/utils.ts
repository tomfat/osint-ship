import { EventRecord } from "./types";

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
  const start = new Date(event.eventStart).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  if (!event.eventEnd) {
    return start;
  }

  const end = new Date(event.eventEnd).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return `${start} – ${end}`;
}

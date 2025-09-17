import { EventRecord } from "./types";

export interface EventFilterOptions {
  vesselId?: string;
  startDate?: string;
  endDate?: string;
}

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

function normalizeEndOfDay(date: string): Date {
  const normalized = new Date(date);
  normalized.setUTCHours(23, 59, 59, 999);
  return normalized;
}

export function getVesselEvents(events: EventRecord[], filters: EventFilterOptions = {}): EventRecord[] {
  const { vesselId, startDate, endDate } = filters;

  const rangeStart = startDate ? new Date(startDate) : undefined;
  const rangeEnd = endDate ? normalizeEndOfDay(endDate) : undefined;

  return events.filter((event) => {
    if (vesselId && event.vesselId !== vesselId) {
      return false;
    }

    if (!rangeStart && !rangeEnd) {
      return true;
    }

    const eventStart = new Date(event.eventDate.start);
    const eventEnd = event.eventDate.end ? new Date(event.eventDate.end) : eventStart;

    if (rangeStart && eventEnd < rangeStart) {
      return false;
    }

    if (rangeEnd && eventStart > rangeEnd) {
      return false;
    }

    return true;
  });
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

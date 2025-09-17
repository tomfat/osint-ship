import { getSupabaseServerClient } from "./client";
import { mapEvent, mapFleetStatistics, mapReviewLog, mapVessel } from "./mappers";
import { SupabaseNotFoundError, SupabaseQueryError, SupabaseValidationError } from "./errors";
import { eventSchema, reviewLogSchema, statsSchema, vesselSchema } from "../schema";
import type { ConfidenceLevel, EventRecord, FleetStatistics, ReviewLog, Vessel } from "../types";

export interface EventFilters {
  vesselId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  confidence?: ConfidenceLevel | null;
}

function filterEventsByDate(events: EventRecord[], filters?: EventFilters): EventRecord[] {
  if (!filters) return events;

  const start = filters.startDate ? new Date(filters.startDate) : undefined;
  const end = filters.endDate ? new Date(filters.endDate) : undefined;

  if (!start && !end) {
    return events;
  }

  return events.filter((event) => {
    if (start) {
      const eventStart = new Date(event.eventDate.start);
      if (eventStart < start) {
        return false;
      }
    }

    if (end) {
      const eventEnd = event.eventDate.end ? new Date(event.eventDate.end) : new Date(event.eventDate.start);
      if (eventEnd > end) {
        return false;
      }
    }

    return true;
  });
}

export async function fetchVessels(): Promise<Vessel[]> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("vessels")
    .select("id, name, hull_number, vessel_class, homeport, image_url")
    .order("name", { ascending: true });

  if (error) {
    throw new SupabaseQueryError("Failed to load vessels from Supabase", error);
  }

  const mapped = (data ?? []).map(mapVessel);
  const parsed = vesselSchema.array().safeParse(mapped);
  if (!parsed.success) {
    throw new SupabaseValidationError("Vessel dataset invalid", parsed.error);
  }

  return parsed.data;
}

export async function fetchEvents(filters?: EventFilters): Promise<EventRecord[]> {
  const client = getSupabaseServerClient();
  let query = client
    .from("events")
    .select(
      [
        "id",
        "vessel_id",
        "event_start",
        "event_end",
        "location_name",
        "location_latitude",
        "location_longitude",
        "confidence",
        "evidence_type",
        "summary",
        "source_url",
        "source_excerpt",
        "last_verified_at",
        "created_at",
        "updated_at",
      ].join(","),
    )
    .order("event_start", { ascending: false });

  if (filters?.vesselId) {
    query = query.eq("vessel_id", filters.vesselId);
  }
  if (filters?.confidence) {
    query = query.eq("confidence", filters.confidence);
  }

  const { data, error } = await query;

  if (error) {
    throw new SupabaseQueryError("Failed to load events from Supabase", error);
  }

  const mapped = (data ?? []).map(mapEvent);
  const parsed = eventSchema.array().safeParse(mapped);
  if (!parsed.success) {
    throw new SupabaseValidationError("Event dataset invalid", parsed.error);
  }

  return filterEventsByDate(parsed.data, filters);
}

export async function fetchEventById(id: string): Promise<EventRecord> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("events")
    .select(
      [
        "id",
        "vessel_id",
        "event_start",
        "event_end",
        "location_name",
        "location_latitude",
        "location_longitude",
        "confidence",
        "evidence_type",
        "summary",
        "source_url",
        "source_excerpt",
        "last_verified_at",
        "created_at",
        "updated_at",
      ].join(","),
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new SupabaseQueryError("Failed to load event from Supabase", error);
  }

  if (!data) {
    throw new SupabaseNotFoundError("Event not found");
  }

  const mapped = mapEvent(data);
  const parsed = eventSchema.safeParse(mapped);
  if (!parsed.success) {
    throw new SupabaseValidationError("Event dataset invalid", parsed.error);
  }

  return parsed.data;
}

export async function fetchReviewLogsForEvent(eventId: string): Promise<ReviewLog[]> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("review_logs")
    .select("id, event_id, reviewer, review_notes, confidence_adjustment, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new SupabaseQueryError("Failed to load review logs from Supabase", error);
  }

  const mapped = (data ?? []).map(mapReviewLog);
  const parsed = reviewLogSchema.array().safeParse(mapped);
  if (!parsed.success) {
    throw new SupabaseValidationError("Review log dataset invalid", parsed.error);
  }

  return parsed.data;
}

export async function fetchFleetStatistics(): Promise<FleetStatistics> {
  const client = getSupabaseServerClient();
  const { data, error } = await client
    .from("fleet_statistics")
    .select("total_vessels, active_deployments, events_last_30_days, vessels_missing_updates, generated_at")
    .maybeSingle();

  if (error) {
    throw new SupabaseQueryError("Failed to load fleet statistics from Supabase", error);
  }

  if (!data) {
    throw new SupabaseNotFoundError("Fleet statistics not available");
  }

  const mapped = mapFleetStatistics(data);
  const parsed = statsSchema.safeParse(mapped);
  if (!parsed.success) {
    throw new SupabaseValidationError("Statistics dataset invalid", parsed.error);
  }

  return parsed.data;
}

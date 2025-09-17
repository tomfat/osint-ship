import { getSupabaseClient } from "./supabase-client";
import { mapEventRow, mapReviewLogRow, mapStatsRow, mapVesselRow } from "./supabase-mappers";
import { eventSchema, reviewLogSchema, statsSchema, vesselSchema } from "./schema";
import { ConfidenceLevel, EventRecord, FleetStatistics, ReviewLog, Vessel } from "./types";

const VESSEL_SELECT_COLUMNS =
  "id, name, hull_number, vessel_class, homeport, image_url, created_at, updated_at";
const EVENT_SELECT_COLUMNS =
  "id, vessel_id, event_start, event_end, latitude, longitude, location_name, confidence, evidence_type, summary, source_url, source_excerpt, last_verified_at, created_at, updated_at";
const REVIEW_LOG_SELECT_COLUMNS =
  "id, event_id, reviewer, review_notes, confidence_adjustment, created_at";
const STATS_SELECT_COLUMNS =
  "total_vessels, active_deployments, events_last_30_days, vessels_missing_updates, generated_at";
const FLEET_STATS_VIEW = "fleet_statistics";

function assertParse<T>(result: { success: true; data: T } | { success: false; error: unknown }, message: string): T {
  if (result.success) {
    return result.data;
  }
  throw new Error(message);
}

export async function getVessels(): Promise<Vessel[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("vessels")
    .select(VESSEL_SELECT_COLUMNS)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load vessels: ${error.message}`);
  }

  const mapped = (data ?? []).map(mapVesselRow);
  return assertParse(vesselSchema.array().safeParse(mapped), "Vessel dataset invalid");
}

type EventFilters = {
  vesselId?: string;
  startDate?: Date;
  endDate?: Date;
  confidence?: ConfidenceLevel;
};

export async function getEvents(filters: EventFilters = {}): Promise<EventRecord[]> {
  const supabase = getSupabaseClient();
  let query = supabase.from("events").select(EVENT_SELECT_COLUMNS).order("last_verified_at", { ascending: false });

  if (filters.vesselId) {
    query = query.eq("vessel_id", filters.vesselId);
  }

  if (filters.confidence) {
    query = query.eq("confidence", filters.confidence);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load events: ${error.message}`);
  }

  const mapped = (data ?? []).map(mapEventRow);

  const filtered = mapped.filter((event) => {
    if (filters.startDate) {
      const eventStart = new Date(event.eventStart);
      if (eventStart < filters.startDate) {
        return false;
      }
    }

    if (filters.endDate) {
      const eventEnd = event.eventEnd ? new Date(event.eventEnd) : new Date(event.eventStart);
      if (eventEnd > filters.endDate) {
        return false;
      }
    }

    return true;
  });

  return assertParse(eventSchema.array().safeParse(filtered), "Event dataset invalid");
}

export async function getEventById(id: string): Promise<EventRecord | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load event: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const event = mapEventRow(data);
  return assertParse(eventSchema.safeParse(event), "Event dataset invalid");
}

export async function getReviewLogsForEvent(eventId: string): Promise<ReviewLog[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("review_logs")
    .select(REVIEW_LOG_SELECT_COLUMNS)
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load review logs: ${error.message}`);
  }

  const mapped = (data ?? []).map(mapReviewLogRow);
  return assertParse(reviewLogSchema.array().safeParse(mapped), "Review log dataset invalid");
}

export async function getFleetStatistics(): Promise<FleetStatistics | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from(FLEET_STATS_VIEW).select(STATS_SELECT_COLUMNS).maybeSingle();

  if (error) {
    throw new Error(`Failed to load fleet statistics: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const stats = mapStatsRow(data);
  return assertParse(statsSchema.safeParse(stats), "Statistics invalid");
}

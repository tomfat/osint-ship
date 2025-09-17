import { getSupabaseClient } from "./supabase-client";
import { mapEventRow, mapFleetStatisticsRow, mapReviewLogRow, mapVesselRow } from "./supabase-mappers";
import type {
  SupabaseEventRow,
  SupabaseFleetStatisticsRow,
  SupabaseReviewLogRow,
  SupabaseVesselRow,
} from "./supabase-types";
import type { ConfidenceLevel, EventRecord, FleetStatistics, ReviewLog, Vessel } from "./types";

export interface EventFilters {
  vesselId?: string;
  startDate?: string;
  endDate?: string;
  confidence?: ConfidenceLevel;
}

function parseDate(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? undefined : timestamp;
}

export async function getVessels(): Promise<Vessel[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("vessels")
    .select("*")
    .order("name", { ascending: true })
    .returns<SupabaseVesselRow[]>();

  if (error) {
    throw new Error(`Failed to fetch vessels: ${error.message}`);
  }

  return (data ?? []).map(mapVesselRow);
}

export async function getEvents(filters: EventFilters = {}): Promise<EventRecord[]> {
  const supabase = getSupabaseClient();
  let query = supabase
    .from("events")
    .select("*")
    .order("last_verified_at", { ascending: false });

  if (filters.vesselId) {
    query = query.eq("vessel_id", filters.vesselId);
  }

  if (filters.confidence) {
    query = query.eq("confidence", filters.confidence);
  }

  const { data, error } = await query.returns<SupabaseEventRow[]>();

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }

  const startTimestamp = parseDate(filters.startDate);
  const endTimestamp = parseDate(filters.endDate);

  return (data ?? [])
    .map(mapEventRow)
    .filter((event) => {
      if (startTimestamp && Date.parse(event.eventDate.start) < startTimestamp) {
        return false;
      }

      if (endTimestamp) {
        const eventEnd = event.eventDate.end ?? event.eventDate.start;
        if (Date.parse(eventEnd) > endTimestamp) {
          return false;
        }
      }

      return true;
    });
}

export async function getEventWithLogs(
  eventId: string,
): Promise<{ event: EventRecord; reviewLogs: ReviewLog[] } | null> {
  const supabase = getSupabaseClient();

  const { data: eventRows, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .limit(1)
    .returns<SupabaseEventRow[]>();

  if (eventError) {
    throw new Error(`Failed to fetch event: ${eventError.message}`);
  }

  const eventRow = eventRows?.[0];
  if (!eventRow) {
    return null;
  }

  const { data: logRows, error: logError } = await supabase
    .from("review_logs")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .returns<SupabaseReviewLogRow[]>();

  if (logError) {
    throw new Error(`Failed to fetch review logs: ${logError.message}`);
  }

  return {
    event: mapEventRow(eventRow),
    reviewLogs: (logRows ?? []).map(mapReviewLogRow),
  };
}

export async function getFleetStatistics(): Promise<FleetStatistics> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("fleet_statistics")
    .select("*")
    .order("generated_at", { ascending: false })
    .limit(1)
    .returns<SupabaseFleetStatisticsRow[]>();

  if (error) {
    throw new Error(`Failed to fetch fleet statistics: ${error.message}`);
  }

  const row = data?.[0];
  if (!row) {
    throw new Error("No fleet statistics available");
  }

  return mapFleetStatisticsRow(row);
}

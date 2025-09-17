import type {
  SupabaseEventRow,
  SupabaseFleetStatisticsRow,
  SupabaseReviewLogRow,
  SupabaseVesselRow,
} from "./supabase-types";
import type { EventRecord, FleetStatistics, ReviewLog, Vessel } from "./types";

export function mapVesselRow(row: SupabaseVesselRow): Vessel {
  return {
    id: row.id,
    name: row.name,
    hullNumber: row.hull_number,
    vesselClass: row.vessel_class,
    homeport: row.homeport ?? undefined,
    image: row.image_url ?? undefined,
  };
}

export function mapEventRow(row: SupabaseEventRow): EventRecord {
  return {
    id: row.id,
    vesselId: row.vessel_id,
    eventDate: {
      start: row.start_at,
      end: row.end_at ?? undefined,
    },
    location: {
      locationName: row.location_name,
      ...(row.latitude === null ? {} : { latitude: row.latitude }),
      ...(row.longitude === null ? {} : { longitude: row.longitude }),
    },
    confidence: row.confidence,
    evidenceType: row.evidence_type,
    summary: row.summary,
    sourceUrl: row.source_url,
    sourceExcerpt: row.source_excerpt ?? undefined,
    lastVerifiedAt: row.last_verified_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapReviewLogRow(row: SupabaseReviewLogRow): ReviewLog {
  return {
    id: row.id,
    eventId: row.event_id,
    reviewer: row.reviewer,
    reviewNotes: row.review_notes,
    confidenceAdjustment: row.confidence_adjustment ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapFleetStatisticsRow(row: SupabaseFleetStatisticsRow): FleetStatistics {
  return {
    totalVessels: row.total_vessels,
    activeDeployments: row.active_deployments,
    eventsLast30Days: row.events_last_30_days,
    vesselsMissingUpdates: row.vessels_missing_updates,
    generatedAt: row.generated_at,
  };
}

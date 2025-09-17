import type { EventRecord, FleetStatistics, ReviewLog, Vessel } from "../types";
import type { EventRow, FleetStatisticsRow, ReviewLogRow, VesselRow } from "./types";

export function mapVessel(row: VesselRow): Vessel {
  return {
    id: row.id,
    name: row.name,
    hullNumber: row.hull_number,
    vesselClass: row.vessel_class,
    homeport: row.homeport ?? undefined,
    image: row.image_url ?? undefined,
  };
}

export function mapEvent(row: EventRow): EventRecord {
  return {
    id: row.id,
    vesselId: row.vessel_id,
    eventDate: {
      start: row.event_start,
      end: row.event_end ?? undefined,
    },
    location: {
      locationName: row.location_name,
      latitude: row.location_latitude ?? undefined,
      longitude: row.location_longitude ?? undefined,
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

export function mapReviewLog(row: ReviewLogRow): ReviewLog {
  return {
    id: row.id,
    eventId: row.event_id,
    reviewer: row.reviewer,
    reviewNotes: row.review_notes,
    confidenceAdjustment: row.confidence_adjustment ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapFleetStatistics(row: FleetStatisticsRow): FleetStatistics {
  return {
    totalVessels: row.total_vessels,
    activeDeployments: row.active_deployments,
    eventsLast30Days: row.events_last_30_days,
    vesselsMissingUpdates: row.vessels_missing_updates,
    generatedAt: row.generated_at,
  };
}

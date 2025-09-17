import { ConfidenceLevel, EventRecord, FleetStatistics, ReviewLog, Vessel } from "./types";

type VesselRow = {
  id: string;
  name: string;
  hull_number: string | null;
  vessel_class: string | null;
  homeport: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string | null;
};

type EventRow = {
  id: string;
  vessel_id: string;
  event_start: string;
  event_end: string | null;
  latitude: number | null;
  longitude: number | null;
  location_name: string;
  confidence: ConfidenceLevel;
  evidence_type: string;
  summary: string;
  source_url: string;
  source_excerpt: string | null;
  last_verified_at: string;
  created_at: string;
  updated_at: string;
};

type ReviewLogRow = {
  id: string;
  event_id: string;
  reviewer: string;
  review_notes: string;
  confidence_adjustment: ConfidenceLevel | null;
  created_at: string;
};

type StatsRow = {
  total_vessels: number;
  active_deployments: number;
  events_last_30_days: number;
  vessels_missing_updates: number;
  generated_at: string;
};

export function mapVesselRow(row: VesselRow): Vessel {
  return {
    id: row.id,
    name: row.name,
    hullNumber: row.hull_number,
    vesselClass: row.vessel_class,
    homeport: row.homeport,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapEventRow(row: EventRow): EventRecord {
  return {
    id: row.id,
    vesselId: row.vessel_id,
    eventStart: row.event_start,
    eventEnd: row.event_end,
    latitude: row.latitude,
    longitude: row.longitude,
    locationName: row.location_name,
    confidence: row.confidence,
    evidenceType: row.evidence_type,
    summary: row.summary,
    sourceUrl: row.source_url,
    sourceExcerpt: row.source_excerpt,
    lastVerifiedAt: row.last_verified_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapReviewLogRow(row: ReviewLogRow): ReviewLog {
  return {
    id: row.id,
    eventId: row.event_id,
    reviewer: row.reviewer,
    reviewNotes: row.review_notes,
    confidenceAdjustment: row.confidence_adjustment,
    createdAt: row.created_at,
  };
}

export function mapStatsRow(row: StatsRow): FleetStatistics {
  return {
    totalVessels: row.total_vessels,
    activeDeployments: row.active_deployments,
    eventsLast30Days: row.events_last_30_days,
    vesselsMissingUpdates: row.vessels_missing_updates,
    generatedAt: row.generated_at,
  };
}

import type { ConfidenceLevel } from "./types";

export interface SupabaseVesselRow {
  id: string;
  name: string;
  hull_number: string;
  vessel_class: string;
  homeport: string | null;
  image_url: string | null;
}

export interface SupabaseEventRow {
  id: string;
  vessel_id: string;
  start_at: string;
  end_at: string | null;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  confidence: ConfidenceLevel;
  evidence_type: string;
  summary: string;
  source_url: string;
  source_excerpt: string | null;
  last_verified_at: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseReviewLogRow {
  id: string;
  event_id: string;
  reviewer: string;
  review_notes: string;
  confidence_adjustment: ConfidenceLevel | null;
  created_at: string;
}

export interface SupabaseFleetStatisticsRow {
  id: string;
  total_vessels: number;
  active_deployments: number;
  events_last_30_days: number;
  vessels_missing_updates: number;
  generated_at: string;
}

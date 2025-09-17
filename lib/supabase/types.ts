import type { ConfidenceLevel } from "../types";

export interface Database {
  public: {
    Tables: {
      vessels: {
        Row: {
          id: string;
          name: string;
          hull_number: string;
          vessel_class: string;
          homeport: string | null;
          image_url: string | null;
        };
      };
      events: {
        Row: {
          id: string;
          vessel_id: string;
          event_start: string;
          event_end: string | null;
          location_name: string;
          location_latitude: number | null;
          location_longitude: number | null;
          confidence: ConfidenceLevel;
          evidence_type: string;
          summary: string;
          source_url: string;
          source_excerpt: string | null;
          last_verified_at: string;
          created_at: string;
          updated_at: string;
        };
      };
      review_logs: {
        Row: {
          id: string;
          event_id: string;
          reviewer: string;
          review_notes: string;
          confidence_adjustment: ConfidenceLevel | null;
          created_at: string;
        };
      };
    };
    Views: {
      fleet_statistics: {
        Row: {
          total_vessels: number;
          active_deployments: number;
          events_last_30_days: number;
          vessels_missing_updates: number;
          generated_at: string;
        };
      };
    };
  };
}

export type VesselRow = Database["public"]["Tables"]["vessels"]["Row"];
export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type ReviewLogRow = Database["public"]["Tables"]["review_logs"]["Row"];
export type FleetStatisticsRow = Database["public"]["Views"]["fleet_statistics"]["Row"];

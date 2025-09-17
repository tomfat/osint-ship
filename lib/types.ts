export type ConfidenceLevel = "High" | "Medium" | "Low";

export interface Vessel {
  id: string;
  name: string;
  hullNumber: string;
  vesselClass: string;
  homeport?: string;
  image?: string;
}

export interface EventLocation {
  latitude?: number;
  longitude?: number;
  locationName: string;
}

export interface EventRecord {
  id: string;
  vesselId: string;
  eventDate: {
    start: string;
    end?: string;
  };
  location: EventLocation;
  confidence: ConfidenceLevel;
  evidenceType: string;
  summary: string;
  sourceUrl: string;
  sourceExcerpt?: string;
  lastVerifiedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewLog {
  id: string;
  eventId: string;
  reviewer: string;
  reviewNotes: string;
  confidenceAdjustment?: ConfidenceLevel;
  createdAt: string;
}

export interface FleetStatistics {
  totalVessels: number;
  activeDeployments: number;
  eventsLast30Days: number;
  vesselsMissingUpdates: number;
  generatedAt: string;
}

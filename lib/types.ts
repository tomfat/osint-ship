export type ConfidenceLevel = "High" | "Medium" | "Low";

export interface Vessel {
  id: string;
  name: string;
  hullNumber: string | null;
  vesselClass: string | null;
  homeport: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface EventRecord {
  id: string;
  vesselId: string;
  eventStart: string;
  eventEnd: string | null;
  latitude: number | null;
  longitude: number | null;
  locationName: string;
  confidence: ConfidenceLevel;
  evidenceType: string;
  summary: string;
  sourceUrl: string;
  sourceExcerpt: string | null;
  lastVerifiedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewLog {
  id: string;
  eventId: string;
  reviewer: string;
  reviewNotes: string;
  confidenceAdjustment: ConfidenceLevel | null;
  createdAt: string;
}

export interface FleetStatistics {
  totalVessels: number;
  activeDeployments: number;
  eventsLast30Days: number;
  vesselsMissingUpdates: number;
  generatedAt: string;
}

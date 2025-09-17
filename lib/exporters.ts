import { EventRecord, Vessel } from "./types";

export const EXPORT_DATASETS = ["events", "vessels"] as const;

export type ExportDataset = (typeof EXPORT_DATASETS)[number];

type CsvPrimitive = string | number | null | undefined;

const NEWLINE = "\r\n";

const EVENT_HEADERS = [
  "id",
  "vessel_id",
  "vessel_name",
  "hull_number",
  "vessel_class",
  "homeport",
  "event_start",
  "event_end",
  "location_name",
  "latitude",
  "longitude",
  "confidence",
  "evidence_type",
  "summary",
  "source_url",
  "source_excerpt",
  "last_verified_at",
  "created_at",
  "updated_at",
] as const;

const VESSEL_HEADERS = [
  "id",
  "name",
  "hull_number",
  "vessel_class",
  "homeport",
  "image",
] as const;

type VesselCsvHeaders = (typeof VESSEL_HEADERS)[number];

interface EventGeoJsonProperties {
  id: string;
  vessel_id: string;
  vessel_name: string | null;
  hull_number: string | null;
  vessel_class: string | null;
  homeport: string | null;
  event_start: string;
  event_end: string | null;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  confidence: string;
  evidence_type: string;
  summary: string;
  source_url: string;
  source_excerpt: string | null;
  last_verified_at: string;
  created_at: string;
  updated_at: string;
}

type VesselGeoJsonProperties = {
  [K in VesselCsvHeaders]: string | null;
};

interface GeoJsonPoint {
  type: "Point";
  coordinates: [number, number];
}

interface GeoJsonFeature<P> {
  type: "Feature";
  geometry: GeoJsonPoint | null;
  properties: P;
}

export interface GeoJsonFeatureCollection<P> {
  type: "FeatureCollection";
  features: Array<GeoJsonFeature<P>>;
}

function formatCsvValue(value: CsvPrimitive): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return "";
    }
    const serialized = value.toString();
    return /[",\n\r]/.test(serialized) ? `"${serialized.replace(/"/g, '""')}"` : serialized;
  }

  const stringValue = String(value);
  if (stringValue === "") {
    return "";
  }

  return /[",\n\r]/.test(stringValue)
    ? `"${stringValue.replace(/"/g, '""')}"`
    : stringValue;
}

function buildCsv(headers: readonly string[], rows: CsvPrimitive[][]): string {
  const formattedRows = rows.map((row) => row.map(formatCsvValue).join(","));
  return [headers.join(","), ...formattedRows].join(NEWLINE).concat(NEWLINE);
}

function roundCoordinate(value: number | undefined): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return Math.round(value * 10) / 10;
}

export function eventsToCsv(events: EventRecord[], vessels: Vessel[]): string {
  const vesselById = new Map(vessels.map((vessel) => [vessel.id, vessel]));

  const rows = events.map((event) => {
    const vessel = vesselById.get(event.vesselId);
    const latitude = roundCoordinate(event.location.latitude);
    const longitude = roundCoordinate(event.location.longitude);

    return [
      event.id,
      event.vesselId,
      vessel?.name ?? null,
      vessel?.hullNumber ?? null,
      vessel?.vesselClass ?? null,
      vessel?.homeport ?? null,
      event.eventDate.start,
      event.eventDate.end ?? null,
      event.location.locationName,
      latitude !== null ? latitude.toFixed(1) : null,
      longitude !== null ? longitude.toFixed(1) : null,
      event.confidence,
      event.evidenceType,
      event.summary,
      event.sourceUrl,
      event.sourceExcerpt ?? null,
      event.lastVerifiedAt,
      event.createdAt,
      event.updatedAt,
    ];
  });

  return buildCsv(EVENT_HEADERS, rows);
}

export function vesselsToCsv(vessels: Vessel[]): string {
  const rows = vessels.map((vessel) => [
    vessel.id,
    vessel.name,
    vessel.hullNumber,
    vessel.vesselClass,
    vessel.homeport ?? null,
    vessel.image ?? null,
  ]);

  return buildCsv(VESSEL_HEADERS, rows);
}

export function eventsToGeoJson(
  events: EventRecord[],
  vessels: Vessel[],
): GeoJsonFeatureCollection<EventGeoJsonProperties> {
  const vesselById = new Map(vessels.map((vessel) => [vessel.id, vessel]));

  const features = events.map((event): GeoJsonFeature<EventGeoJsonProperties> => {
    const vessel = vesselById.get(event.vesselId);
    const latitude = roundCoordinate(event.location.latitude);
    const longitude = roundCoordinate(event.location.longitude);

    const geometry =
      latitude !== null && longitude !== null
        ? ({
            type: "Point",
            coordinates: [longitude, latitude],
          } satisfies GeoJsonPoint)
        : null;

    const properties: EventGeoJsonProperties = {
      id: event.id,
      vessel_id: event.vesselId,
      vessel_name: vessel?.name ?? null,
      hull_number: vessel?.hullNumber ?? null,
      vessel_class: vessel?.vesselClass ?? null,
      homeport: vessel?.homeport ?? null,
      event_start: event.eventDate.start,
      event_end: event.eventDate.end ?? null,
      location_name: event.location.locationName,
      latitude,
      longitude,
      confidence: event.confidence,
      evidence_type: event.evidenceType,
      summary: event.summary,
      source_url: event.sourceUrl,
      source_excerpt: event.sourceExcerpt ?? null,
      last_verified_at: event.lastVerifiedAt,
      created_at: event.createdAt,
      updated_at: event.updatedAt,
    };

    return {
      type: "Feature",
      geometry,
      properties,
    };
  });

  return {
    type: "FeatureCollection",
    features,
  };
}

export function vesselsToGeoJson(vessels: Vessel[]): GeoJsonFeatureCollection<VesselGeoJsonProperties> {
  const features = vessels.map((vessel): GeoJsonFeature<VesselGeoJsonProperties> => ({
    type: "Feature",
    geometry: null,
    properties: {
      id: vessel.id,
      name: vessel.name,
      hull_number: vessel.hullNumber,
      vessel_class: vessel.vesselClass,
      homeport: vessel.homeport ?? null,
      image: vessel.image ?? null,
    },
  }));

  return {
    type: "FeatureCollection",
    features,
  };
}

export function isExportDataset(value: string | null | undefined): value is ExportDataset {
  return EXPORT_DATASETS.includes((value ?? "") as ExportDataset);
}


import { EventRecord, Vessel } from "./types";

export type ExportDataset = "events" | "vessels";

type CsvValue = string | number | boolean | null | undefined;

interface GeoJsonPoint {
  type: "Point";
  coordinates: [number, number];
}

interface GeoJsonFeature<P> {
  type: "Feature";
  geometry: GeoJsonPoint | null;
  properties: P;
}

interface GeoJsonFeatureCollection<P> {
  type: "FeatureCollection";
  features: Array<GeoJsonFeature<P>>;
}

const EVENT_HEADERS = [
  "id",
  "vessel_id",
  "vessel_name",
  "hull_number",
  "vessel_class",
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

function escapeCsvValue(value: CsvValue): string {
  if (value === null || value === undefined) {
    return "";
  }
  const stringValue = String(value);
  if (stringValue === "") {
    return "";
  }
  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
}

function roundCoordinate(value: number | undefined): number | undefined {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined;
  }
  return Math.round(value * 10) / 10;
}

export function eventsToCsv(events: EventRecord[], vessels: Vessel[]): string {
  const vesselLookup = new Map(vessels.map((vessel) => [vessel.id, vessel]));
  const headerRow = EVENT_HEADERS.join(",");
  const rows = events.map((event) => {
    const vessel = vesselLookup.get(event.vesselId);
    const latitude = roundCoordinate(event.location.latitude);
    const longitude = roundCoordinate(event.location.longitude);
    const values: CsvValue[] = [
      event.id,
      event.vesselId,
      vessel?.name ?? null,
      vessel?.hullNumber ?? null,
      vessel?.vesselClass ?? null,
      event.eventDate.start,
      event.eventDate.end ?? null,
      event.location.locationName,
      latitude !== undefined ? latitude.toFixed(1) : null,
      longitude !== undefined ? longitude.toFixed(1) : null,
      event.confidence,
      event.evidenceType,
      event.summary,
      event.sourceUrl,
      event.sourceExcerpt ?? null,
      event.lastVerifiedAt,
      event.createdAt,
      event.updatedAt,
    ];
    return values.map(escapeCsvValue).join(",");
  });

  return [headerRow, ...rows].join("\n");
}

export function vesselsToCsv(vessels: Vessel[]): string {
  const headerRow = VESSEL_HEADERS.join(",");
  const rows = vessels.map((vessel) => {
    const values: CsvValue[] = [
      vessel.id,
      vessel.name,
      vessel.hullNumber,
      vessel.vesselClass,
      vessel.homeport ?? null,
      vessel.image ?? null,
    ];
    return values.map(escapeCsvValue).join(",");
  });

  return [headerRow, ...rows].join("\n");
}

export function eventsToGeoJson(
  events: EventRecord[],
  vessels: Vessel[],
): GeoJsonFeatureCollection<Record<(typeof EVENT_HEADERS)[number], string | number | null>> {
  const vesselLookup = new Map(vessels.map((vessel) => [vessel.id, vessel]));

  const features = events.map((event): GeoJsonFeature<Record<(typeof EVENT_HEADERS)[number], string | number | null>> => {
    const vessel = vesselLookup.get(event.vesselId);
    const latitude = roundCoordinate(event.location.latitude);
    const longitude = roundCoordinate(event.location.longitude);
    const geometry: GeoJsonPoint | null =
      latitude !== undefined && longitude !== undefined
        ? { type: "Point", coordinates: [longitude, latitude] as [number, number] }
        : null;

    const properties: Record<(typeof EVENT_HEADERS)[number], string | number | null> = {
      id: event.id,
      vessel_id: event.vesselId,
      vessel_name: vessel?.name ?? null,
      hull_number: vessel?.hullNumber ?? null,
      vessel_class: vessel?.vesselClass ?? null,
      event_start: event.eventDate.start,
      event_end: event.eventDate.end ?? null,
      location_name: event.location.locationName,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
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

export function vesselsToGeoJson(
  vessels: Vessel[],
): GeoJsonFeatureCollection<{ [K in (typeof VESSEL_HEADERS)[number]]: string | null }> {
  const features = vessels.map((vessel): GeoJsonFeature<{ [K in (typeof VESSEL_HEADERS)[number]]: string | null }> => {
    const properties: { [K in (typeof VESSEL_HEADERS)[number]]: string | null } = {
      id: vessel.id,
      name: vessel.name,
      hull_number: vessel.hullNumber,
      vessel_class: vessel.vesselClass,
      homeport: vessel.homeport ?? null,
      image: vessel.image ?? null,
    };

    return {
      type: "Feature",
      geometry: null,
      properties,
    };
  });

  return {
    type: "FeatureCollection",
    features,
  };
}

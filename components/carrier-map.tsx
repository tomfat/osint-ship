"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import type { EventRecord, Vessel, ConfidenceLevel } from "@/lib/types";
import { formatDateRange } from "@/lib/utils";
import { ConfidenceBadge } from "./confidence-badge";

type LatLngTuple = [number, number];

const DEFAULT_CENTER: LatLngTuple = [20, 0];
const DEFAULT_ZOOM = 2;
const SINGLE_EVENT_ZOOM = 5;

const CONFIDENCE_COLORS: Record<ConfidenceLevel, { color: string; fillColor: string }> = {
  High: { color: "#34d399", fillColor: "#34d399" },
  Medium: { color: "#f59e0b", fillColor: "#f59e0b" },
  Low: { color: "#f87171", fillColor: "#f87171" },
};

interface CarrierMapProps {
  events: EventRecord[];
  vessels: Vessel[];
  className?: string;
}

function MapViewController({
  center,
  bounds,
  zoom,
}: {
  center: LatLngTuple;
  bounds: LatLngTuple[] | null;
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 6 });
      return;
    }

    map.setView(center, zoom);
  }, [bounds, center, map, zoom]);

  return null;
}

export function CarrierMap({ events, vessels, className }: CarrierMapProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const mapboxStyleId = process.env.NEXT_PUBLIC_MAPBOX_STYLE_ID ?? "mapbox/dark-v11";

  const eventsWithCoordinates = useMemo(
    () =>
      events.filter(
        (event) =>
          typeof event.location.latitude === "number" && typeof event.location.longitude === "number",
      ),
    [events],
  );

  const positions = useMemo<LatLngTuple[]>(
    () =>
      eventsWithCoordinates.map(
        (event) => [event.location.latitude as number, event.location.longitude as number],
      ),
    [eventsWithCoordinates],
  );

  const bounds = useMemo<LatLngTuple[] | null>(() => {
    if (positions.length < 2) {
      return null;
    }

    let minLat = positions[0][0];
    let maxLat = positions[0][0];
    let minLng = positions[0][1];
    let maxLng = positions[0][1];

    for (const [lat, lng] of positions.slice(1)) {
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    }

    return [
      [minLat, minLng],
      [maxLat, maxLng],
    ];
  }, [positions]);

  const initialCenter = positions[0] ?? DEFAULT_CENTER;
  const initialZoom = positions.length === 1 ? SINGLE_EVENT_ZOOM : DEFAULT_ZOOM;

  const vesselLookup = useMemo(() => new Map(vessels.map((vessel) => [vessel.id, vessel])), [vessels]);

  if (!mapboxToken) {
    return (
      <div
        className={`rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200 ${
          className ?? ""
        }`}
      >
        Map display unavailable. Add a valid <code className="font-mono">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> to enable
        map tiles.
      </div>
    );
  }

  if (eventsWithCoordinates.length === 0) {
    return (
      <div
        className={`rounded-lg border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300 ${className ?? ""}`}
      >
        No events include coordinate data yet. Verified positions will appear here once latitude and longitude are
        available.
      </div>
    );
  }

  const tileUrl = `https://api.mapbox.com/styles/v1/${mapboxStyleId}/tiles/512/{z}/{x}/{y}@2x?access_token=${mapboxToken}`;
  const tileAttribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>';

  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 shadow-lg shadow-slate-950/50 ${
        className ?? ""
      }`}
    >
      <MapContainer
        className="h-[420px] w-full"
        center={initialCenter}
        zoom={initialZoom}
        scrollWheelZoom
        worldCopyJump
        preferCanvas
      >
        <TileLayer
          attribution={tileAttribution}
          url={tileUrl}
          tileSize={512}
          zoomOffset={-1}
        />
        <MapViewController center={initialCenter} bounds={bounds} zoom={initialZoom} />
        {eventsWithCoordinates.map((event) => {
          const position: LatLngTuple = [
            event.location.latitude as number,
            event.location.longitude as number,
          ];
          const confidenceStyle = CONFIDENCE_COLORS[event.confidence];
          const vessel = vesselLookup.get(event.vesselId);

          return (
            <CircleMarker
              key={event.id}
              center={position}
              pathOptions={{
                color: confidenceStyle.color,
                fillColor: confidenceStyle.fillColor,
                fillOpacity: 0.75,
                weight: 2,
              }}
              radius={8}
            >
              <Popup>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{vessel?.name ?? "Unknown vessel"}</p>
                    <p className="text-xs text-slate-400">{vessel?.hullNumber ?? "Hull unknown"}</p>
                  </div>
                  <ConfidenceBadge level={event.confidence} />
                  <div className="space-y-1 text-xs text-slate-300">
                    <p className="font-medium text-slate-200">{event.location.locationName}</p>
                    <p className="text-slate-400">{formatDateRange(event)}</p>
                    <p className="text-slate-400">Last verified {new Date(event.lastVerifiedAt).toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-slate-300">{event.summary}</p>
                  <a
                    href={event.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs font-medium text-navy-200 hover:text-navy-100"
                  >
                    View source ↗
                  </a>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}


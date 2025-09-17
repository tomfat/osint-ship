import { NextRequest, NextResponse } from "next/server";

import { events } from "@/lib/data/events";
import { vessels } from "@/lib/data/vessels";
import { eventsToGeoJson, ExportDataset, isExportDataset, vesselsToGeoJson } from "@/lib/exporters";

const CACHE_CONTROL = "public, max-age=3600, stale-while-revalidate=86400";

function resolveDataset(request: NextRequest): ExportDataset | null {
  const dataset = request.nextUrl.searchParams.get("dataset");
  if (dataset === null) {
    return "events";
  }

  return isExportDataset(dataset) ? dataset : null;
}

export async function GET(request: NextRequest) {
  const dataset = resolveDataset(request);

  if (!dataset) {
    return NextResponse.json(
      { error: "Invalid dataset. Supported values are 'events' or 'vessels'." },
      { status: 400 },
    );
  }

  const payload = dataset === "events" ? eventsToGeoJson(events, vessels) : vesselsToGeoJson(vessels);
  const filename = `osint-${dataset}.geojson`;

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/geo+json; charset=utf-8",
      "Cache-Control": CACHE_CONTROL,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}


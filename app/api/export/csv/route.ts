import { NextRequest, NextResponse } from "next/server";
import { events } from "@/lib/data/events";
import { vessels } from "@/lib/data/vessels";
import { eventsToCsv, ExportDataset, vesselsToCsv } from "@/lib/exporters";

const CACHE_CONTROL = "public, max-age=3600, stale-while-revalidate=86400";

function parseDataset(value: string | null): ExportDataset | null {
  if (value === null) {
    return "events";
  }
  if (value === "events" || value === "vessels") {
    return value;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const dataset = parseDataset(request.nextUrl.searchParams.get("dataset"));

  if (!dataset) {
    return NextResponse.json({ error: "Invalid dataset. Use 'events' or 'vessels'." }, { status: 400 });
  }

  const body = dataset === "events" ? eventsToCsv(events, vessels) : vesselsToCsv(vessels);
  const filename = `osint-${dataset}.csv`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": CACHE_CONTROL,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

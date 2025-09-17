import { NextRequest, NextResponse } from "next/server";
import { getEvents } from "@/lib/queries";
import { ConfidenceLevel } from "@/lib/types";

function filterByConfidence(value: string | null): ConfidenceLevel | undefined {
  if (!value) return undefined;
  if (value === "High" || value === "Medium" || value === "Low") {
    return value;
  }
  return undefined;
}

function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const vesselId = searchParams.get("vessel") ?? undefined;
  const startDate = parseDate(searchParams.get("start_date"));
  const endDate = parseDate(searchParams.get("end_date"));
  const confidence = filterByConfidence(searchParams.get("confidence"));

  try {
    const events = await getEvents({ vesselId, startDate, endDate, confidence });
    return NextResponse.json({ data: events, count: events.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to load events", details: message }, { status: 500 });
  }
}

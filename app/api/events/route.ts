import { NextRequest, NextResponse } from "next/server";
import { events } from "@/lib/data/events";
import { eventSchema } from "@/lib/schema";
import { ConfidenceLevel } from "@/lib/types";

function filterByConfidence(value: string | null): ConfidenceLevel | undefined {
  if (!value) return undefined;
  if (value === "High" || value === "Medium" || value === "Low") {
    return value;
  }
  return undefined;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const vesselId = searchParams.get("vessel");
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");
  const confidence = filterByConfidence(searchParams.get("confidence"));

  const filtered = events.filter((event) => {
    if (vesselId && event.vesselId !== vesselId) {
      return false;
    }
    if (confidence && event.confidence !== confidence) {
      return false;
    }
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const eventStart = new Date(event.eventDate.start);
    if (start && eventStart < start) {
      return false;
    }
    if (end) {
      const eventEnd = event.eventDate.end ? new Date(event.eventDate.end) : eventStart;
      if (eventEnd > end) {
        return false;
      }
    }
    return true;
  });

  const parsed = eventSchema.array().safeParse(filtered);
  if (!parsed.success) {
    return NextResponse.json({ error: "Event dataset invalid", details: parsed.error.format() }, { status: 500 });
  }

  return NextResponse.json({ data: parsed.data, count: parsed.data.length });
}

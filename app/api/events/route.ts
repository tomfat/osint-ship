import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getEvents } from "@/lib/queries";
import { confidenceSchema, eventSchema } from "@/lib/schema";

const querySchema = z.object({
  vessel: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  confidence: confidenceSchema.optional(),
});

export async function GET(request: NextRequest) {
  const result = querySchema.safeParse({
    vessel: request.nextUrl.searchParams.get("vessel") ?? undefined,
    start_date: request.nextUrl.searchParams.get("start_date") ?? undefined,
    end_date: request.nextUrl.searchParams.get("end_date") ?? undefined,
    confidence: request.nextUrl.searchParams.get("confidence") ?? undefined,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: result.error.format() },
      { status: 400 },
    );
  }

  try {
    const events = await getEvents({
      vesselId: result.data.vessel,
      startDate: result.data.start_date,
      endDate: result.data.end_date,
      confidence: result.data.confidence,
    });

    const parsed = eventSchema.array().safeParse(events);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Event dataset invalid", details: parsed.error.format() },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: parsed.data, count: parsed.data.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch events", details: message }, { status: 500 });
  }
}

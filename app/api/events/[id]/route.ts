import { NextRequest, NextResponse } from "next/server";
import { events } from "@/lib/data/events";
import { reviewLogs } from "@/lib/data/review-logs";
import { eventSchema, reviewLogSchema } from "@/lib/schema";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const event = events.find((item) => item.id === params.id);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const parsedEvent = eventSchema.safeParse(event);
  if (!parsedEvent.success) {
    return NextResponse.json({ error: "Event schema invalid", details: parsedEvent.error.format() }, { status: 500 });
  }

  const logs = reviewLogs.filter((log) => log.eventId === event.id);
  const parsedLogs = reviewLogSchema.array().safeParse(logs);
  if (!parsedLogs.success) {
    return NextResponse.json({ error: "Review logs invalid", details: parsedLogs.error.format() }, { status: 500 });
  }

  return NextResponse.json({ data: parsedEvent.data, reviewLogs: parsedLogs.data });
}

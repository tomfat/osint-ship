import { NextResponse } from "next/server";
import { fleetStats } from "@/lib/data/stats";
import { statsSchema } from "@/lib/schema";

export async function GET() {
  const parsed = statsSchema.safeParse(fleetStats);
  if (!parsed.success) {
    return NextResponse.json({ error: "Statistics invalid", details: parsed.error.format() }, { status: 500 });
  }

  return NextResponse.json({ data: parsed.data });
}

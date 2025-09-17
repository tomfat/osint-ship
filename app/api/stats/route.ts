import { NextResponse } from "next/server";
import { getFleetStatistics } from "@/lib/queries";
import { statsSchema } from "@/lib/schema";

export async function GET() {
  try {
    const stats = await getFleetStatistics();
    const parsed = statsSchema.safeParse(stats);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Statistics invalid", details: parsed.error.format() },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: parsed.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch statistics", details: message }, { status: 500 });
  }
}

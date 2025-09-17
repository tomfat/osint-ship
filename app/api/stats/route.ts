import { NextResponse } from "next/server";
import { getFleetStatistics } from "@/lib/queries";

export async function GET() {
  try {
    const stats = await getFleetStatistics();

    if (!stats) {
      return NextResponse.json({ error: "Fleet statistics not available" }, { status: 404 });
    }

    return NextResponse.json({ data: stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to load fleet statistics", details: message }, { status: 500 });
  }
}

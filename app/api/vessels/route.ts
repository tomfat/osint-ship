import { NextResponse } from "next/server";
import { getVessels } from "@/lib/queries";

export async function GET() {
  try {
    const vessels = await getVessels();
    return NextResponse.json({ data: vessels, count: vessels.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to load vessels", details: message }, { status: 500 });
  }
}

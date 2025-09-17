import { NextResponse } from "next/server";
import { getVessels } from "@/lib/queries";
import { vesselSchema } from "@/lib/schema";

export async function GET() {
  try {
    const vessels = await getVessels();
    const parsed = vesselSchema.array().safeParse(vessels);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Vessel dataset invalid", details: parsed.error.format() },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: parsed.data, count: parsed.data.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch vessels", details: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { vessels } from "@/lib/data/vessels";
import { vesselSchema } from "@/lib/schema";

export async function GET() {
  const parsed = vesselSchema.array().safeParse(vessels);
  if (!parsed.success) {
    return NextResponse.json({ error: "Vessel dataset invalid", details: parsed.error.format() }, { status: 500 });
  }

  return NextResponse.json({ data: parsed.data, count: parsed.data.length });
}

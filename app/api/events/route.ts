import { NextRequest, NextResponse } from "next/server";
import { fetchEvents } from "@/lib/supabase/queries";
import { supabaseErrorResponse } from "@/lib/supabase/route-helpers";
import type { ConfidenceLevel } from "@/lib/types";

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

  try {
    const data = await fetchEvents({ vesselId, startDate, endDate, confidence });
    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    return supabaseErrorResponse(error, "Failed to fetch events");
  }
}

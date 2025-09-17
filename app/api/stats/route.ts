import { NextResponse } from "next/server";
import { fetchFleetStatistics } from "@/lib/supabase/queries";
import { supabaseErrorResponse } from "@/lib/supabase/route-helpers";

export async function GET() {
  try {
    const data = await fetchFleetStatistics();
    return NextResponse.json({ data });
  } catch (error) {
    return supabaseErrorResponse(error, "Failed to fetch fleet statistics");
  }
}

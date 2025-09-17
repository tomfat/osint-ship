import { NextResponse } from "next/server";
import { fetchVessels } from "@/lib/supabase/queries";
import { supabaseErrorResponse } from "@/lib/supabase/route-helpers";

export async function GET() {
  try {
    const data = await fetchVessels();
    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    return supabaseErrorResponse(error, "Failed to fetch vessels");
  }
}

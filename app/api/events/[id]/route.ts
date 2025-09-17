import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { fetchEventById, fetchReviewLogsForEvent } from "@/lib/supabase/queries";
import { supabaseErrorResponse } from "@/lib/supabase/route-helpers";
import { z } from "zod";

type RouteParams = {
  params: {
    id: string;
  };
};

const eventIdSchema = z.string().uuid();
const cacheControlHeader = "public, max-age=60, stale-while-revalidate=300";

export async function GET(request: NextRequest, { params }: RouteParams) {
  const parsedId = eventIdSchema.safeParse(params.id);

  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid event id" }, { status: 422 });
  }

  try {
    const [event, reviewLogs] = await Promise.all([
      fetchEventById(parsedId.data),
      fetchReviewLogsForEvent(parsedId.data),
    ]);

    const payload = {
      data: {
        event,
        reviewLogs,
      },
    };

    const etag = createHash("sha1").update(JSON.stringify(payload)).digest("hex");
    const weakEtag = `W/"${etag}"`;

    const lastModifiedDate = new Date(event.updatedAt);
    const lastModified = Number.isNaN(lastModifiedDate.getTime())
      ? undefined
      : lastModifiedDate.toUTCString();

    if (request.headers.get("if-none-match") === weakEtag) {
      const headers = new Headers({
        ETag: weakEtag,
        "Cache-Control": cacheControlHeader,
      });
      if (lastModified) {
        headers.set("Last-Modified", lastModified);
      }
      return new NextResponse(null, {
        status: 304,
        headers,
      });
    }

    const response = NextResponse.json(payload, {
      headers: {
        ETag: weakEtag,
        "Cache-Control": cacheControlHeader,
      },
    });

    if (lastModified) {
      response.headers.set("Last-Modified", lastModified);
    }

    return response;
  } catch (error) {
    return supabaseErrorResponse(error, "Failed to fetch event details");
  }
}

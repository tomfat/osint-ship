import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getEventWithLogs } from "@/lib/queries";
import { eventSchema, reviewLogSchema } from "@/lib/schema";

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
    const result = await getEventWithLogs(parsedId.data);

    if (!result) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const validatedEvent = eventSchema.safeParse(result.event);
    if (!validatedEvent.success) {
      return NextResponse.json(
        { error: "Event dataset invalid", details: validatedEvent.error.format() },
        { status: 500 },
      );
    }

    const validatedLogs = reviewLogSchema.array().safeParse(result.reviewLogs);
    if (!validatedLogs.success) {
      return NextResponse.json(
        { error: "Review log dataset invalid", details: validatedLogs.error.format() },
        { status: 500 },
      );
    }

    const payload = {
      data: {
        event: validatedEvent.data,
        reviewLogs: validatedLogs.data,
      },
    };

    const etag = createHash("sha1").update(JSON.stringify(payload)).digest("hex");
    const weakEtag = `W/"${etag}"`;

    const lastModifiedDate = new Date(validatedEvent.data.updatedAt);
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
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch event", details: message }, { status: 500 });
  }
}

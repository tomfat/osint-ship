import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ConfidenceBadge } from "@/components/confidence-badge";
import { formatDateRange } from "@/lib/utils";
import type { EventRecord, ReviewLog } from "@/lib/types";
import { vessels } from "@/lib/data/vessels";

interface EventDetailResponse {
  data: {
    event: EventRecord;
    reviewLogs: ReviewLog[];
  };
  error?: string;
}

async function fetchEventDetail(
  id: string,
): Promise<{ event: EventRecord; reviewLogs: ReviewLog[] } | null> {
  const headerList = headers();
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const host = headerList.get("host");

  if (!host) {
    throw new Error("Unable to resolve request host for event lookup.");
  }

  const url = `${protocol}://${host}/api/events/${id}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 60 },
  });

  if (response.status === 404 || response.status === 422) {
    return null;
  }

  if (!response.ok) {
    let errorMessage = `Unable to load event details (status ${response.status}).`;
    try {
      const payload = (await response.json()) as EventDetailResponse;
      if (payload?.error) {
        errorMessage = payload.error;
      }
    } catch (error) {
      // Ignore JSON parsing failures for error responses.
    }
    throw new Error(errorMessage);
  }

  try {
    const payload = (await response.json()) as EventDetailResponse;
    if (!payload?.data) {
      throw new Error(payload?.error ?? "Event detail payload was empty.");
    }
    return payload.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to parse event detail response.");
  }
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const data = await fetchEventDetail(params.id);
    if (!data) {
      return {
        title: "Event not found",
      };
    }

    const vessel = vessels.find((entry) => entry.id === data.event.vesselId);
    const vesselName = vessel?.name ?? "Unknown vessel";

    return {
      title: `${vesselName} event details`,
      description: data.event.summary,
    };
  } catch (error) {
    return {
      title: "Event details",
    };
  }
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const data = await fetchEventDetail(params.id);

  if (!data) {
    notFound();
  }

  const { event, reviewLogs } = data;
  const vessel = vessels.find((entry) => entry.id === event.vesselId);
  const sortedLogs = [...reviewLogs].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <div className="space-y-8">
      <Link href="/" className="inline-flex items-center text-sm text-slate-400 transition hover:text-white">
        ← Back to dashboard
      </Link>

      <section className="rounded-xl border border-slate-800 bg-slate-950/80 p-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{vessel?.hullNumber ?? "Unknown hull"}</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">{vessel?.name ?? "Unknown vessel"}</h1>
            <p className="mt-2 text-sm text-slate-400">{formatDateRange(event)}</p>
          </div>
          <ConfidenceBadge level={event.confidence} />
        </header>

        <div className="mt-6 space-y-4 text-sm text-slate-300">
          <p>{event.summary}</p>
          {event.sourceExcerpt ? (
            <p className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-400">
              {event.sourceExcerpt}
            </p>
          ) : null}

          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Location</dt>
              <dd className="mt-1 text-sm text-slate-200">{event.location.locationName}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Evidence</dt>
              <dd className="mt-1 text-sm text-slate-200">{event.evidenceType}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Last verified</dt>
              <dd className="mt-1 text-sm text-slate-200">
                {new Date(event.lastVerifiedAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Source</dt>
              <dd className="mt-1 text-sm">
                <a
                  href={event.sourceUrl}
                  className="text-navy-200 transition hover:text-navy-100"
                  target="_blank"
                  rel="noreferrer"
                >
                  View original report ↗
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950/80 p-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Review history</h2>
            <p className="text-sm text-slate-400">
              Chronological audit trail of analyst review notes and confidence adjustments.
            </p>
          </div>
        </header>

        {sortedLogs.length > 0 ? (
          <ol className="mt-6 space-y-4">
            {sortedLogs.map((log) => (
              <li key={log.id} className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{log.reviewer}</p>
                    <p className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                  {log.confidenceAdjustment ? (
                    <div className="text-right">
                      <span className="block text-xs uppercase tracking-wide text-slate-500">
                        Confidence set to
                      </span>
                      <ConfidenceBadge level={log.confidenceAdjustment} />
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No confidence adjustment recorded</p>
                  )}
                </div>
                <p className="mt-3 text-sm text-slate-300">{log.reviewNotes}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-6 text-sm text-slate-400">No review history has been recorded for this event yet.</p>
        )}
      </section>
    </div>
  );
}

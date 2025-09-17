import { EventTable } from "@/components/event-table";
import { ExportControls } from "@/components/export-controls";
import { events } from "@/lib/data/events";
import { vessels } from "@/lib/data/vessels";

export default function DataPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-6">
        <h1 className="text-2xl font-semibold text-white">Structured Data Explorer</h1>
        <p className="mt-2 text-sm text-slate-300">
          Download sanitized CSV and GeoJSON snapshots that mirror the table schema. Coordinates are rounded to the nearest
          0.1° per our disclosure policy and headers remain stable for downstream ingestion.
        </p>
        <div className="mt-4 space-y-3 rounded border border-slate-800 bg-slate-900/60 p-4">
          <div>
            <h2 className="text-sm font-semibold text-white">CSV &amp; GeoJSON exports</h2>
            <p className="mt-1 text-xs text-slate-400">
              Choose a dataset/format combination below. Requests hit the public API routes with cache headers, and inline
              status messages will confirm when a snapshot is being prepared or if something goes wrong.
            </p>
          </div>
          <ExportControls />
        </div>
      </section>
      <EventTable events={events} vessels={vessels} />
    </div>
  );
}

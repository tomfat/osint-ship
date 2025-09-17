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
          Download sanitized exports for research workflows. Snapshots are rounded to 0.1° latitude/longitude to align with
          our publication policy and include consistent field ordering for downstream ingestion.
        </p>
        <div className="mt-4 rounded border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-sm font-semibold text-white">CSV &amp; GeoJSON exports</h2>
          <p className="mt-2 text-xs text-slate-400">
            Choose a dataset/format combination below. Downloads stream from the public API routes with caching enabled;
            you&apos;ll see a status hint while the file is prepared and any errors will be surfaced inline.
          </p>
          <div className="mt-3">
            <ExportControls />
          </div>
        </div>
      </section>
      <EventTable events={events} vessels={vessels} />
    </div>
  );
}

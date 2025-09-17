import { EventTable } from "@/components/event-table";
import { getEvents, getVessels } from "@/lib/queries";

export default async function DataPage() {
  const [vessels, events] = await Promise.all([getVessels(), getEvents()]);

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-6">
        <h1 className="text-2xl font-semibold text-white">Structured Data Explorer</h1>
        <p className="mt-2 text-sm text-slate-300">
          Filterable tables and future CSV/GeoJSON export endpoints will live here. Data is curated from public reporting,
          enriched with analyst annotations, and validated during build using schema checks.
        </p>
        <div className="mt-4 rounded border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-400">
          CSV &amp; GeoJSON download links will be exposed after the automated ingestion pipeline is connected to Supabase.
        </div>
      </section>
      <EventTable events={events} vessels={vessels} />
    </div>
  );
}

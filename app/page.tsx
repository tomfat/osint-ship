import { Dashboard } from "@/components/dashboard";
import { fetchEvents, fetchFleetStatistics, fetchVessels } from "@/lib/supabase/queries";

export default async function HomePage() {
  const [vessels, events, stats] = await Promise.all([
    fetchVessels(),
    fetchEvents(),
    fetchFleetStatistics(),
  ]);

  return (
    <div className="space-y-12">
      <section className="rounded-xl border border-slate-800 bg-gradient-to-br from-navy-900/40 via-slate-950 to-slate-950 p-8">
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">U.S. Carrier Deployments at a Glance</h1>
        <p className="mt-4 max-w-3xl text-base text-slate-300">
          OSINT Carrier Tracker consolidates publicly verifiable reporting on U.S. Navy aircraft carriers. Each position is
          timestamped, graded for confidence, and linked to the original source so analysts can trace the intel pipeline.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-navy-800/50 bg-navy-900/30 p-4 text-sm text-slate-200">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-200">Transparency First</h2>
            <p className="mt-2 text-slate-300">Every event includes primary sourcing, analyst notes, and review history.</p>
          </div>
          <div className="rounded-lg border border-navy-800/50 bg-navy-900/30 p-4 text-sm text-slate-200">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-200">Confidence Ratings</h2>
            <p className="mt-2 text-slate-300">OSINT is uncertain—confidence scores highlight corroborated vs. speculative reports.</p>
          </div>
          <div className="rounded-lg border border-navy-800/50 bg-navy-900/30 p-4 text-sm text-slate-200">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-200">Ethical OSINT</h2>
            <p className="mt-2 text-slate-300">Positions are delayed and generalized to protect operations and comply with policy.</p>
          </div>
        </div>
      </section>
      <Dashboard vessels={vessels} events={events} stats={stats} />
    </div>
  );
}

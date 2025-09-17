interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
}

export function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 shadow-lg">
      <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-3 text-sm text-slate-400">{description}</p>
    </div>
  );
}

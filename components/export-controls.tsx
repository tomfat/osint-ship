"use client";

import { useCallback, useMemo, useState } from "react";

type Dataset = "events" | "vessels";
type Format = "csv" | "geojson";

const DATASETS: Array<{ id: Dataset; label: string }> = [
  { id: "events", label: "Event records" },
  { id: "vessels", label: "Vessel registry" },
];

const FORMATS: Array<{ id: Format; label: string; endpoint: string }> = [
  { id: "csv", label: "CSV", endpoint: "/api/export/csv" },
  { id: "geojson", label: "GeoJSON", endpoint: "/api/export/geojson" },
];

interface DownloadState {
  dataset: Dataset;
  format: Format;
}

function buildFilename(dataset: Dataset, format: Format) {
  return `osint-${dataset}.${format === "csv" ? "csv" : "geojson"}`;
}

export function ExportControls() {
  const [activeDownload, setActiveDownload] = useState<DownloadState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const combinations = useMemo(() => {
    const entries: Array<{ dataset: Dataset; format: Format }> = [];
    for (const dataset of DATASETS) {
      for (const format of FORMATS) {
        entries.push({ dataset: dataset.id, format: format.id });
      }
    }
    return entries;
  }, []);

  const handleDownload = useCallback(async (dataset: Dataset, format: Format) => {
    setError(null);
    setActiveDownload({ dataset, format });

    const endpoint = FORMATS.find((item) => item.id === format)?.endpoint ?? "/api/export/csv";
    const url = `${endpoint}?dataset=${dataset}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = buildFilename(dataset, format);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (fetchError) {
      console.error(fetchError);
      setError(`Unable to export ${dataset} data as ${format.toUpperCase()}. Please retry.`);
    } finally {
      setActiveDownload(null);
    }
  }, []);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {combinations.map(({ dataset, format }) => {
          const isActive = activeDownload?.dataset === dataset && activeDownload?.format === format;
          const datasetLabel = DATASETS.find((entry) => entry.id === dataset)?.label ?? dataset;
          const formatLabel = FORMATS.find((entry) => entry.id === format)?.label ?? format.toUpperCase();
          return (
            <button
              key={`${dataset}-${format}`}
              type="button"
              onClick={() => handleDownload(dataset, format)}
              disabled={Boolean(activeDownload)}
              aria-busy={isActive}
              className="inline-flex items-center rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-navy-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isActive ? "Preparing download…" : `${datasetLabel} (${formatLabel})`}
            </button>
          );
        })}
      </div>
      <div className="mt-2 space-y-1 text-xs" aria-live="polite">
        {activeDownload && (
          <p className="text-slate-400">
            Preparing {DATASETS.find((entry) => entry.id === activeDownload.dataset)?.label ?? activeDownload.dataset} export in
            {" "}
            {FORMATS.find((entry) => entry.id === activeDownload.format)?.label ?? activeDownload.format.toUpperCase()} format…
          </p>
        )}
        {error && <p className="text-rose-300">{error}</p>}
      </div>
    </div>
  );
}


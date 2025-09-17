"use client";

import { useCallback, useMemo, useState } from "react";

type Dataset = "events" | "vessels";
type Format = "csv" | "geojson";

type DownloadingState = {
  dataset: Dataset;
  format: Format;
};

const FORMAT_ENDPOINT: Record<Format, string> = {
  csv: "/api/export/csv",
  geojson: "/api/export/geojson",
};

const DATASET_LABEL: Record<Dataset, string> = {
  events: "Event records",
  vessels: "Vessel registry",
};

const FORMAT_LABEL: Record<Format, string> = {
  csv: "CSV",
  geojson: "GeoJSON",
};

function buildFilename(dataset: Dataset, format: Format) {
  const extension = format === "csv" ? "csv" : "geojson";
  return `osint-${dataset}.${extension}`;
}

export function ExportControls() {
  const [downloading, setDownloading] = useState<DownloadingState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buttons = useMemo(() => {
    const pairs: Array<{ dataset: Dataset; format: Format }> = [];
    (Object.keys(DATASET_LABEL) as Dataset[]).forEach((dataset) => {
      (Object.keys(FORMAT_ENDPOINT) as Format[]).forEach((format) => {
        pairs.push({ dataset, format });
      });
    });
    return pairs;
  }, []);

  const handleDownload = useCallback(async (dataset: Dataset, format: Format) => {
    setError(null);
    setDownloading({ dataset, format });

    try {
      const response = await fetch(`${FORMAT_ENDPOINT[format]}?dataset=${dataset}`);
      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = buildFilename(dataset, format);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(`Unable to export ${DATASET_LABEL[dataset]} as ${FORMAT_LABEL[format]}. Please try again.`);
    } finally {
      setDownloading(null);
    }
  }, []);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {buttons.map(({ dataset, format }) => {
          const isActive = downloading?.dataset === dataset && downloading?.format === format;
          const label = `${DATASET_LABEL[dataset]} (${FORMAT_LABEL[format]})`;
          return (
            <button
              key={`${dataset}-${format}`}
              type="button"
              onClick={() => handleDownload(dataset, format)}
              disabled={Boolean(downloading)}
              aria-busy={isActive}
              className="inline-flex items-center rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-navy-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isActive ? "Preparing download…" : label}
            </button>
          );
        })}
      </div>
      {downloading && (
        <p className="mt-2 text-xs text-slate-400">
          Preparing {DATASET_LABEL[downloading.dataset]} {FORMAT_LABEL[downloading.format]} snapshot…
        </p>
      )}
      {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
    </div>
  );
}

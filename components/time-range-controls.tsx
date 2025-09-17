"use client";

import React, { ChangeEvent, useMemo } from "react";

export interface TimeRange {
  startDate?: string;
  endDate?: string;
}

interface TimeRangeControlsProps extends TimeRange {
  minDate?: string;
  maxDate?: string;
  onRangeChange: (range: TimeRange) => void;
}

function clampToBounds(value: string, minDate: string, maxDate: string): string {
  if (value < minDate) {
    return minDate;
  }
  if (value > maxDate) {
    return maxDate;
  }
  return value;
}

function formatDisplayLabel(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function TimeRangeControls({
  minDate,
  maxDate,
  startDate,
  endDate,
  onRangeChange,
}: TimeRangeControlsProps) {
  if (!minDate || !maxDate) {
    return (
      <div
        className="flex min-w-[14rem] flex-col gap-2 rounded border border-slate-800 bg-slate-900/40 px-3 py-2"
        data-testid="time-range-empty"
      >
        <span className="text-xs uppercase tracking-wide text-slate-500">Time Window</span>
        <span className="text-xs text-slate-500">No events available to derive a date range.</span>
      </div>
    );
  }

  const displayStart = startDate ?? minDate;
  const displayEnd = endDate ?? maxDate;

  const summaryLabel = useMemo(() => {
    if (!displayStart && !displayEnd) {
      return null;
    }
    return `${formatDisplayLabel(displayStart)} – ${formatDisplayLabel(displayEnd)}`;
  }, [displayEnd, displayStart]);

  const handleStartChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!minDate || !maxDate) {
      return;
    }
    const raw = event.target.value;
    const nextStart = clampToBounds(raw || minDate, minDate, maxDate);
    const nextEnd = displayEnd < nextStart ? nextStart : displayEnd;
    onRangeChange({ startDate: nextStart, endDate: nextEnd });
  };

  const handleEndChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!minDate || !maxDate) {
      return;
    }
    const raw = event.target.value;
    const nextEnd = clampToBounds(raw || maxDate, minDate, maxDate);
    const nextStart = displayStart > nextEnd ? nextEnd : displayStart;
    onRangeChange({ startDate: nextStart, endDate: nextEnd });
  };

  const handleReset = () => {
    onRangeChange({ startDate: minDate, endDate: maxDate });
  };

  return (
    <div className="flex min-w-[14rem] flex-col gap-2">
      <span className="text-xs uppercase tracking-wide text-slate-500">Time Window</span>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs text-slate-400">
          <span>Start</span>
          <input
            type="date"
            name="start-date"
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
            value={displayStart}
            min={minDate}
            max={displayEnd}
            onChange={handleStartChange}
          />
        </label>
        <span className="pb-3 text-xs text-slate-500">to</span>
        <label className="flex flex-col gap-1 text-xs text-slate-400">
          <span>End</span>
          <input
            type="date"
            name="end-date"
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
            value={displayEnd}
            min={displayStart}
            max={maxDate}
            onChange={handleEndChange}
          />
        </label>
        <button
          type="button"
          onClick={handleReset}
          className="rounded border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-slate-600 hover:text-white"
        >
          Reset
        </button>
      </div>
      {summaryLabel ? <p className="text-xs text-slate-500">{summaryLabel}</p> : null}
    </div>
  );
}

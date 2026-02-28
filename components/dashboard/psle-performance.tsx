"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMultipleDatasets } from "@/hooks/use-dataset";
import { useFilterStore } from "@/lib/store";
import { DATASET_IDS, DatasetRow } from "@/types";
import { ChartCard } from "./chart-card";
import { FileX } from "lucide-react";

const PSLE_DATASETS = {
  english: DATASET_IDS.psleEnglish,
  math: DATASET_IDS.psleMath,
  motherTongue: DATASET_IDS.psleMotherTongue,
  science: DATASET_IDS.psleScience,
};

const SUBJECT_COLORS: Record<string, string> = {
  English: "url(#colorEnglish)",
  Mathematics: "url(#colorMath)",
  "Mother Tongue": "url(#colorMT)",
  Science: "url(#colorScience)",
};

const SUBJECT_KEYS: Record<string, string> = {
  english: "English",
  math: "Mathematics",
  motherTongue: "Mother Tongue",
  science: "Science",
};

const SUBJECT_COLUMNS: Record<string, string> = {
  english: "percentage_psle_eng",
  math: "percentage_psle_math",
  motherTongue: "percentage_psle_mt",
  science: "percentage_psle_sci",
};

function extractYear(row: DatasetRow): number {
  return Number(row.year ?? row.Year);
}

function extractPercentage(row: DatasetRow, colName: string): number {
  const val = row[colName];
  if (typeof val === "string") {
    return parseFloat(val) || 0;
  }
  return Number(val) || 0;
}

function extractRace(row: DatasetRow): string {
  return String(row.race ?? row.Race ?? "").toLowerCase();
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg font-mono text-xs">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground">
      <FileX className="h-10 w-10 mb-3 opacity-50" />
      <p className="text-sm font-medium">No data available</p>
      <p className="text-xs opacity-70">Try adjusting your filters</p>
    </div>
  );
}

export function PSLEPerformance() {
  const { activeFilters, applyTrigger } = useFilterStore();
  const { data, loading, error } = useMultipleDatasets(
    PSLE_DATASETS,
    applyTrigger
  );

  const chartData = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return [];

    const yearMap: Record<number, Record<string, number>> = {};

    for (const [key, rows] of Object.entries(data)) {
      const subjectLabel = SUBJECT_KEYS[key];
      const colName = SUBJECT_COLUMNS[key];
      if (!subjectLabel || !colName) continue;

      if (
        activeFilters.subject !== "all" &&
        activeFilters.subject !== subjectLabel
      )
        continue;

      for (const row of rows) {
        const year = extractYear(row);
        if (year < activeFilters.yearStart || year > activeFilters.yearEnd)
          continue;

        const race = extractRace(row);
        if (
          activeFilters.race !== "all" &&
          race !== "overall" &&
          !race.includes(activeFilters.race.toLowerCase())
        )
          continue;

        if (race === "overall" || activeFilters.race === "all") {
          const percentage = extractPercentage(row, colName);
          if (percentage > 0) {
            if (!yearMap[year]) yearMap[year] = {};
            yearMap[year][subjectLabel] = percentage;
          }
        } else if (race.includes(activeFilters.race.toLowerCase())) {
          const percentage = extractPercentage(row, colName);
          if (percentage > 0) {
            if (!yearMap[year]) yearMap[year] = {};
            yearMap[year][subjectLabel] = percentage;
          }
        }
      }
    }

    return Object.entries(yearMap)
      .map(([year, subjects]) => ({ year: Number(year), ...subjects }))
      .sort((a, b) => a.year - b.year);
  }, [data, activeFilters]);

  const subjectsToShow = useMemo(() => {
    if (activeFilters.subject !== "all") return [activeFilters.subject];
    return Object.values(SUBJECT_KEYS);
  }, [activeFilters.subject]);

  const hasData = chartData.length > 0;

  return (
    <ChartCard
      title="PSLE Performance (% Pass Rate AL 1-6)"
      description="Percentage of students achieving Achievement Levels 1-6 by subject"
      loading={loading}
      error={error}
      empty={!hasData && !loading}
    >
      {!hasData && !loading ? (
        <EmptyState />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <defs>
              <linearGradient id="colorEnglish" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.4}/>
              </linearGradient>
              <linearGradient id="colorMath" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4}/>
              </linearGradient>
              <linearGradient id="colorMT" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.4}/>
              </linearGradient>
              <linearGradient id="colorScience" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.4}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="1 1" className="opacity-40" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace', fill: 'hsl(var(--foreground))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              stroke="hsl(var(--foreground))"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace', fill: 'hsl(var(--foreground))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              stroke="hsl(var(--foreground))"
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
            <Legend 
              wrapperStyle={{ paddingTop: '10px', fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'hsl(var(--foreground))' }}
            />
            {subjectsToShow.map((subject) => (
              <Bar
                key={subject}
                dataKey={subject}
                fill={SUBJECT_COLORS[subject] ?? "var(--chart-5)"}
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
                stroke="none"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

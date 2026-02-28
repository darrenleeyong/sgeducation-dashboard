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

const PSLE_DATASETS = {
  english: DATASET_IDS.psleEnglish,
  math: DATASET_IDS.psleMath,
  motherTongue: DATASET_IDS.psleMotherTongue,
  science: DATASET_IDS.psleScience,
};

const SUBJECT_COLORS: Record<string, string> = {
  English: "var(--chart-1)",
  Mathematics: "var(--chart-2)",
  "Mother Tongue": "var(--chart-3)",
  Science: "var(--chart-4)",
};

const SUBJECT_KEYS: Record<string, string> = {
  english: "English",
  math: "Mathematics",
  motherTongue: "Mother Tongue",
  science: "Science",
};

function extractYear(row: DatasetRow): number {
  const val = row.year ?? row.Year ?? row._id;
  return Number(val);
}

function extractCount(row: DatasetRow): number {
  const val =
    row.no_of_pupils ??
    row.number ??
    row.count ??
    row.no_of_students ??
    row.pupils ??
    0;
  return Number(val) || 0;
}

function extractAL(row: DatasetRow): string {
  const val =
    row.achievement_level ??
    row.al ??
    row.grade ??
    row.Achievement_Level ??
    "";
  return String(val);
}

function extractSex(row: DatasetRow): string {
  const val = row.sex ?? row.Sex ?? row.gender ?? "";
  return String(val).toLowerCase();
}

function extractRace(row: DatasetRow): string {
  const val = row.race ?? row.Race ?? row.ethnic_group ?? "";
  return String(val);
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
      if (!subjectLabel) continue;

      if (
        activeFilters.subject !== "all" &&
        activeFilters.subject !== subjectLabel
      )
        continue;

      for (const row of rows) {
        const year = extractYear(row);
        if (year < activeFilters.yearStart || year > activeFilters.yearEnd)
          continue;

        const al = extractAL(row);
        if (al && !["1", "2", "3", "4", "5", "6", "AL 1", "AL 2", "AL 3", "AL 4", "AL 5", "AL 6"].some(
          (v) => al.includes(v) || al === v
        ))
          continue;

        const sex = extractSex(row);
        if (sex && sex !== "mf" && sex !== "total" && sex !== "") {
          continue;
        }

        const race = extractRace(row);
        if (
          activeFilters.race !== "all" &&
          race &&
          !race.toLowerCase().includes(activeFilters.race.toLowerCase())
        )
          continue;

        if (!yearMap[year]) yearMap[year] = {};
        yearMap[year][subjectLabel] =
          (yearMap[year][subjectLabel] ?? 0) + extractCount(row);
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

  return (
    <ChartCard
      title="PSLE Performance (Achievement Levels 1-6)"
      description="Number of pupils by subject across years"
      loading={loading}
      error={error}
    >
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          {subjectsToShow.map((subject) => (
            <Bar
              key={subject}
              dataKey={subject}
              fill={SUBJECT_COLORS[subject] ?? "var(--chart-5)"}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

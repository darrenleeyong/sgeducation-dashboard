"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
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
import { KPICard } from "./kpi-card";
import { Users, School, BookOpen, LayoutGrid } from "lucide-react";

const METRIC_DATASETS = {
  pupilsPerTeacher: DATASET_IDS.pupilsPerTeacher,
  schoolTypes: DATASET_IDS.schoolTypes,
  enrolment: DATASET_IDS.enrolment,
  classSizes: DATASET_IDS.classSizes,
};

function toNum(v: unknown): number {
  return Number(v) || 0;
}

function getYear(row: DatasetRow): number {
  return toNum(row.year ?? row.Year ?? row._id);
}

export function SchoolMetrics() {
  const { activeFilters, applyTrigger } = useFilterStore();
  const { data, loading, error } = useMultipleDatasets(
    METRIC_DATASETS,
    applyTrigger
  );

  const pupilTeacherData = useMemo(() => {
    const rows = data?.pupilsPerTeacher ?? [];
    const yearMap: Record<number, number> = {};

    for (const row of rows) {
      const year = getYear(row);
      if (year < activeFilters.yearStart || year > activeFilters.yearEnd)
        continue;

      const ratio = toNum(
        row.pupil_teacher_ratio ??
          row.ratio ??
          row.pupils_per_teacher ??
          row.average_pupil_teacher_ratio ??
          0
      );
      if (ratio > 0) yearMap[year] = ratio;
    }

    return Object.entries(yearMap)
      .map(([year, ratio]) => ({ year: Number(year), ratio }))
      .sort((a, b) => a.year - b.year);
  }, [data, activeFilters]);

  const classSizeData = useMemo(() => {
    const rows = data?.classSizes ?? [];
    const yearMap: Record<number, { total: number; count: number }> = {};

    for (const row of rows) {
      const year = getYear(row);
      if (year < activeFilters.yearStart || year > activeFilters.yearEnd)
        continue;

      const level = String(
        row.level ?? row.Level ?? row.school_level ?? ""
      ).toLowerCase();
      if (
        activeFilters.schoolLevel !== "all" &&
        level &&
        !level.includes(activeFilters.schoolLevel.toLowerCase())
      )
        continue;

      const size = toNum(
        row.average_class_size ??
          row.class_size ??
          row.size ??
          row.avg_size ??
          0
      );
      if (size > 0) {
        if (!yearMap[year]) yearMap[year] = { total: 0, count: 0 };
        yearMap[year].total += size;
        yearMap[year].count += 1;
      }
    }

    return Object.entries(yearMap)
      .map(([year, { total, count }]) => ({
        year: Number(year),
        avgSize: Math.round((total / count) * 10) / 10,
      }))
      .sort((a, b) => a.year - b.year);
  }, [data, activeFilters]);

  const kpis = useMemo(() => {
    const latestYear = activeFilters.yearEnd;

    const enrolmentRows = data?.enrolment ?? [];
    let totalEnrolment = 0;
    for (const row of enrolmentRows) {
      if (getYear(row) === latestYear) {
        totalEnrolment += toNum(
          row.enrolment ??
            row.no_of_pupils ??
            row.total ??
            row.number ??
            0
        );
      }
    }

    const schoolTypeRows = data?.schoolTypes ?? [];
    let totalSchools = 0;
    for (const row of schoolTypeRows) {
      if (getYear(row) === latestYear) {
        totalSchools += toNum(
          row.no_of_schools ?? row.count ?? row.number ?? 0
        );
      }
    }

    const latestRatio =
      pupilTeacherData.length > 0
        ? pupilTeacherData[pupilTeacherData.length - 1].ratio
        : 0;

    const latestClassSize =
      classSizeData.length > 0
        ? classSizeData[classSizeData.length - 1].avgSize
        : 0;

    return { totalEnrolment, totalSchools, latestRatio, latestClassSize };
  }, [data, activeFilters, pupilTeacherData, classSizeData]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          title="Total Enrolment"
          value={kpis.totalEnrolment.toLocaleString()}
          subtitle={`Year ${activeFilters.yearEnd}`}
          icon={<Users className="h-4 w-4" />}
          loading={loading}
        />
        <KPICard
          title="Schools"
          value={kpis.totalSchools.toLocaleString()}
          subtitle={`Year ${activeFilters.yearEnd}`}
          icon={<School className="h-4 w-4" />}
          loading={loading}
        />
        <KPICard
          title="Pupil-Teacher Ratio"
          value={kpis.latestRatio > 0 ? kpis.latestRatio.toFixed(1) : "—"}
          subtitle="Pupils per teacher"
          icon={<BookOpen className="h-4 w-4" />}
          loading={loading}
        />
        <KPICard
          title="Avg Class Size"
          value={kpis.latestClassSize > 0 ? kpis.latestClassSize.toFixed(1) : "—"}
          subtitle="Students per class"
          icon={<LayoutGrid className="h-4 w-4" />}
          loading={loading}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <ChartCard
          title="Pupils per Teacher Ratio"
          description="Trend over time"
          loading={loading}
          error={error}
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={pupilTeacherData}>
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="ratio"
                name="Pupil-Teacher Ratio"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Average Class Size"
          description="Trend over time"
          loading={loading}
          error={error}
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={classSizeData}>
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgSize"
                name="Avg Class Size"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

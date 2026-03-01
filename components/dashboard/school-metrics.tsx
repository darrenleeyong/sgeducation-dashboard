"use client";

import { useMemo, useState, useEffect } from "react";
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
import { Users, School, BookOpen, LayoutGrid, FileX } from "lucide-react";
import { loadClassSizeData, ClassSizeRow } from "@/lib/csv-data";

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
  return toNum(row.year ?? row.Year);
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg font-mono text-xs">
        <p className="font-semibold text-card-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[240px] text-muted-foreground">
      <FileX className="h-10 w-10 mb-3 opacity-50" />
      <p className="text-sm font-medium">No data available</p>
      <p className="text-xs opacity-70">Try adjusting your filters</p>
    </div>
  );
}

export function SchoolMetrics() {
  const { activeFilters, applyTrigger } = useFilterStore();
  const { data, loading, error } = useMultipleDatasets(
    METRIC_DATASETS,
    applyTrigger
  );

  // Load CSV data for class size
  const [csvData, setCsvData] = useState<ClassSizeRow[]>([]);
  const [csvLoading, setCsvLoading] = useState(true);

  useEffect(() => {
    loadClassSizeData()
      .then(setCsvData)
      .catch(console.error)
      .finally(() => setCsvLoading(false));
  }, []);

  // Use CSV data for class size charts
  const classSizeData = useMemo(() => {
    if (csvLoading || csvData.length === 0) return [];
    
    const yearMap: Record<number, { totalSize: number; countSize: number; totalClasses: number; countClasses: number }> = {};

    for (const row of csvData) {
      const year = row.year;
      if (year < activeFilters.yearStart || year > activeFilters.yearEnd)
        continue;

      const size = row.ave_class_size;
      const classes = row.no_of_classes;

      if (!yearMap[year]) {
        yearMap[year] = { totalSize: 0, countSize: 0, totalClasses: 0, countClasses: 0 };
      }

      if (size > 0) {
        yearMap[year].totalSize += size;
        yearMap[year].countSize += 1;
      }
      if (classes > 0) {
        yearMap[year].totalClasses += classes;
        yearMap[year].countClasses += 1;
      }
    }

    return Object.entries(yearMap)
      .map(([year, { totalSize, countSize, totalClasses, countClasses }]) => ({
        year: Number(year),
        avgSize: countSize > 0 ? Math.round((totalSize / countSize) * 10) / 10 : 0,
        totalClasses: totalClasses,
      }))
      .sort((a, b) => a.year - b.year);
  }, [csvData, csvLoading, activeFilters]);

  const pupilTeacherData = useMemo(() => {
    const rows = data?.pupilsPerTeacher ?? [];
    const yearMap: Record<number, number> = {};

    for (const row of rows) {
      const year = getYear(row);
      if (year < activeFilters.yearStart || year > activeFilters.yearEnd)
        continue;

      const ratio = toNum(
        row.pri_students_to_teachers ??
          row.pupil_teacher_ratio ??
          row.ratio ??
          0
      );
      if (ratio > 0) yearMap[year] = ratio;
    }

    return Object.entries(yearMap)
      .map(([year, ratio]) => ({ year: Number(year), ratio }))
      .sort((a, b) => a.year - b.year);
  }, [data, activeFilters]);

  const kpis = useMemo(() => {
    const latestYear = activeFilters.yearEnd;

    const enrolmentRows = data?.enrolment ?? [];
    let totalEnrolment = 0;
    for (const row of enrolmentRows) {
      const rowYear = getYear(row);
      if (rowYear === latestYear) {
        const sex = String(row.sex ?? row.Sex ?? "").toUpperCase();
        if (sex === "MF" || sex === "TOTAL" || sex === "") {
          totalEnrolment += toNum(
            row.enrolment ??
              row.ENROLMENT ??
              row.no_of_pupils ??
              row.total ??
              0
          );
        }
      }
    }

    const schoolTypeRows = data?.schoolTypes ?? [];
    let totalSchools = 0;
    for (const row of schoolTypeRows) {
      if (getYear(row) === latestYear) {
        totalSchools += toNum(
          row.number_of_pri_sch ??
            row.no_of_schools ??
            row.count ??
            row.number ??
            0
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
  }, [data, activeFilters, pupilTeacherData, classSizeData, csvLoading]);

  const hasRatioData = pupilTeacherData.length > 0;
  const hasClassSizeData = classSizeData.length > 0 && !csvLoading;

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
          empty={!hasRatioData && !loading}
        >
          {hasRatioData ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={pupilTeacherData}>
                <defs>
                  <linearGradient id="gradientRatio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
                <Legend wrapperStyle={{ paddingTop: '10px', fontFamily: 'var(--font-jetbrains-mono), monospace' }} />
                <Line
                  type="monotone"
                  dataKey="ratio"
                  name="Pupil-Teacher Ratio"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', r: 4, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                  activeDot={{ r: 6, fill: '#22c55e' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </ChartCard>

        <ChartCard
          title="Average Class Size"
          description="Trend over time"
          loading={loading}
          error={error}
          empty={!hasClassSizeData && !loading}
        >
          {hasClassSizeData ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={classSizeData}>
                <defs>
                  <linearGradient id="gradientClassSize" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
                <Legend wrapperStyle={{ paddingTop: '10px', fontFamily: 'var(--font-jetbrains-mono), monospace' }} />
                <Line
                  type="monotone"
                  dataKey="avgSize"
                  name="Avg Class Size"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                  activeDot={{ r: 6, fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </ChartCard>

        <ChartCard
          title="Number of Classes"
          description="Total number of classes over time"
          loading={loading}
          error={error}
          empty={!hasClassSizeData && !loading}
        >
          {hasClassSizeData ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={classSizeData}>
                <defs>
                  <linearGradient id="gradientNumClasses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
                <Legend wrapperStyle={{ paddingTop: '10px', fontFamily: 'var(--font-jetbrains-mono), monospace' }} />
                <Line
                  type="monotone"
                  dataKey="totalClasses"
                  name="No. of Classes"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                  activeDot={{ r: 6, fill: '#8b5cf6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </ChartCard>
      </div>
    </div>
  );
}

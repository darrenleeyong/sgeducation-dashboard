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
import { KPICard } from "./kpi-card";
import { GraduationCap, MapPin } from "lucide-react";

const INFO_DATASETS = {
  teachers: DATASET_IDS.teachersInSchools,
  schoolInfo: DATASET_IDS.schoolInfo,
};

function toNum(v: unknown): number {
  return Number(v) || 0;
}

function getYear(row: DatasetRow): number {
  return toNum(row.year ?? row.Year ?? row._id);
}

export function GeneralInfo() {
  const { activeFilters, applyTrigger } = useFilterStore();
  const { data, loading, error } = useMultipleDatasets(
    INFO_DATASETS,
    applyTrigger
  );

  const teacherData = useMemo(() => {
    const rows = data?.teachers ?? [];
    const yearMap: Record<number, number> = {};

    for (const row of rows) {
      const year = getYear(row);
      if (year < activeFilters.yearStart || year > activeFilters.yearEnd)
        continue;

      const count = toNum(
        row.no_of_teachers ??
          row.teachers ??
          row.count ??
          row.number ??
          row.total ??
          0
      );

      const sex = String(row.sex ?? row.Sex ?? row.gender ?? "").toLowerCase();
      if (sex && sex !== "mf" && sex !== "total" && sex !== "") continue;

      if (count > 0) {
        yearMap[year] = (yearMap[year] ?? 0) + count;
      }
    }

    return Object.entries(yearMap)
      .map(([year, teachers]) => ({ year: Number(year), teachers }))
      .sort((a, b) => a.year - b.year);
  }, [data, activeFilters]);

  const schoolInfoStats = useMemo(() => {
    const rows = data?.schoolInfo ?? [];
    const zoneMap: Record<string, number> = {};

    for (const row of rows) {
      const zone = String(
        row.zone_code ?? row.zone ?? row.dgp_code ?? "Unknown"
      );
      zoneMap[zone] = (zoneMap[zone] ?? 0) + 1;
    }

    return {
      totalSchools: rows.length,
      zones: Object.entries(zoneMap)
        .map(([zone, count]) => ({ zone, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8),
    };
  }, [data]);

  const latestTeacherCount =
    teacherData.length > 0
      ? teacherData[teacherData.length - 1].teachers
      : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <KPICard
          title="Total Teachers"
          value={latestTeacherCount.toLocaleString()}
          subtitle={`Year ${activeFilters.yearEnd}`}
          icon={<GraduationCap className="h-4 w-4" />}
          loading={loading}
        />
        <KPICard
          title="Schools Listed"
          value={schoolInfoStats.totalSchools.toLocaleString()}
          subtitle="In directory"
          icon={<MapPin className="h-4 w-4" />}
          loading={loading}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <ChartCard
          title="Teachers in Primary Schools"
          description="Total number of teachers over time"
          loading={loading}
          error={error}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={teacherData}>
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
                  v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
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
              <Bar
                dataKey="teachers"
                name="Teachers"
                fill="var(--chart-3)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Schools by Zone"
          description="Distribution of primary schools across zones"
          loading={loading}
          error={error}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={schoolInfoStats.zones}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="zone"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="count"
                name="Schools"
                fill="var(--chart-4)"
                radius={[0, 4, 4, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

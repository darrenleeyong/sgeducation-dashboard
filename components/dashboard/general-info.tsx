"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMultipleDatasets } from "@/hooks/use-dataset";
import { useFilterStore } from "@/lib/store";
import { DATASET_IDS, DatasetRow } from "@/types";
import { ChartCard } from "./chart-card";
import { KPICard } from "./kpi-card";
import { GraduationCap, MapPin, FileX } from "lucide-react";

const INFO_DATASETS = {
  teachers: DATASET_IDS.teachersInSchools,
  schoolInfo: DATASET_IDS.schoolInfo,
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
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
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
          0
      );

      const sex = String(row.sex ?? row.Sex ?? "").toLowerCase();
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
    
    const schools = new Set<string>();
    const zoneMap: Record<string, number> = {};

    for (const row of rows) {
      const name = String(row.school_name ?? row.name ?? "");
      if (name && !schools.has(name)) {
        schools.add(name);
        
        const zone = String(
          row.zone_code ?? row.zone ?? row.dgp_code ?? "Unknown"
        );
        zoneMap[zone] = (zoneMap[zone] ?? 0) + 1;
      }
    }

    return {
      totalSchools: schools.size,
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

  const hasTeacherData = teacherData.length > 0;
  const hasZoneData = schoolInfoStats.zones.length > 0;

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
          empty={!hasTeacherData && !loading}
        >
          {hasTeacherData ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={teacherData}>
                <defs>
                  <linearGradient id="gradientTeachers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="1 1" className="opacity-40" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace', fill: 'hsl(var(--foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace', fill: 'hsl(var(--foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                  }
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
                <Bar
                  dataKey="teachers"
                  name="Teachers"
                  fill="url(#gradientTeachers)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                  stroke="none"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </ChartCard>

        <ChartCard
          title="Schools by Zone"
          description="Distribution of primary schools across zones"
          loading={loading}
          error={error}
          empty={!hasZoneData && !loading}
        >
          {hasZoneData ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={schoolInfoStats.zones}
                layout="vertical"
              >
                <defs>
                  <linearGradient id="gradientZones" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="1 1" className="opacity-40" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace', fill: 'hsl(var(--foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  type="category"
                  dataKey="zone"
                  tick={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace', fill: 'hsl(var(--foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
                <Bar
                  dataKey="count"
                  name="Schools"
                  fill="url(#gradientZones)"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={24}
                  stroke="none"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </ChartCard>
      </div>
    </div>
  );
}

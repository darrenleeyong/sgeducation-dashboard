"use client";

import { useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { useFilterStore } from "@/lib/store";
import { loadTeachersPrimaryData, loadTeachersAgeData, loadTeachersLengthOfServiceData, TeachersPrimaryRow, TeachersAgeRow, TeachersLengthOfServiceRow } from "@/lib/csv-data";
import { ChartCard } from "./chart-card";
import { KPICard } from "./kpi-card";
import { GraduationCap, MapPin, FileX } from "lucide-react";

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
        {payload.length > 1 && (
          <p className="font-semibold text-card-foreground mt-1 pt-1 border-t border-border">
            Total: {payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0).toLocaleString()}
          </p>
        )}
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

const AGE_ORDER = ['24 YEARS & BELOW', '25 - 29', '30 - 34', '35 - 39', '40 - 44', '45 - 49', '50 - 54', '55 & ABOVE'];
const SERVICE_ORDER = ['0 - 4 YEARS', '5 - 9 YEARS', '10 - 14 YEARS', '15 - 19 YEARS', '20 - 24 YEARS', '25 - 29 YEARS', '30 YEARS & ABOVE'];

export function GeneralInfo() {
  const { activeFilters } = useFilterStore();
  const [csvData, setCsvData] = useState<TeachersPrimaryRow[]>([]);
  const [ageData, setAgeData] = useState<TeachersAgeRow[]>([]);
  const [serviceData, setServiceData] = useState<TeachersLengthOfServiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      loadTeachersPrimaryData(),
      loadTeachersAgeData(),
      loadTeachersLengthOfServiceData()
    ])
      .then(([primary, age, service]) => {
        setCsvData(primary);
        setAgeData(age);
        setServiceData(service);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const teacherData = useMemo(() => {
    const yearMap: Record<number, { 
      year: number; 
      governmentMale: number; 
      governmentFemale: number;
      governmentAidedMale: number;
      governmentAidedFemale: number;
    }> = {};

    for (const row of csvData) {
      const year = row.year;
      if (year < activeFilters.yearStart || year > activeFilters.yearEnd)
        continue;

      if (!yearMap[year]) {
        yearMap[year] = { 
          year, 
          governmentMale: 0, 
          governmentFemale: 0,
          governmentAidedMale: 0,
          governmentAidedFemale: 0
        };
      }

      if (row.school_type === 'Government') {
        if (row.sex === 'MF') {
          yearMap[year].governmentMale = row.teachers_pri;
        } else if (row.sex === 'F') {
          yearMap[year].governmentFemale = row.teachers_pri;
        }
      } else if (row.school_type === 'Government-Aided') {
        if (row.sex === 'MF') {
          yearMap[year].governmentAidedMale = row.teachers_pri;
        } else if (row.sex === 'F') {
          yearMap[year].governmentAidedFemale = row.teachers_pri;
        }
      }
    }

    for (const year of Object.keys(yearMap)) {
      const y = yearMap[Number(year)];
      y.governmentMale = Math.max(0, y.governmentMale - y.governmentFemale);
      y.governmentAidedMale = Math.max(0, y.governmentAidedMale - y.governmentAidedFemale);
    }

    return Object.values(yearMap).sort((a, b) => a.year - b.year);
  }, [csvData, activeFilters]);

  const ageChartData = useMemo(() => {
    const year = activeFilters.yearEnd;
    const yearData = ageData.filter(row => row.year === year && row.sex === 'MF');
    
    const ageMap: Record<string, number> = {};
    for (const row of yearData) {
      ageMap[row.age] = row.no_of_teachers;
    }

    return AGE_ORDER.map(age => ({
      age: age.replace(' YEARS & BELOW', '').replace(' YEARS', '').replace(' - ', '-'),
      teachers: ageMap[age] || 0
    }));
  }, [ageData, activeFilters]);

  const serviceChartData = useMemo(() => {
    const year = activeFilters.yearEnd;
    const yearData = serviceData.filter(row => row.year === year && row.sex === 'MF');
    
    const serviceMap: Record<string, number> = {};
    for (const row of yearData) {
      serviceMap[row.length_of_service] = row.no_of_teachers;
    }

    return SERVICE_ORDER.map(service => ({
      service: service.replace(' YEARS', '').replace(' - ', '-').replace('0 - 4', '0-4').replace('5 - 9', '5-9'),
      teachers: serviceMap[service] || 0
    }));
  }, [serviceData, activeFilters]);

  const latestTeacherCount = teacherData.length > 0
    ? teacherData[teacherData.length - 1].governmentMale + teacherData[teacherData.length - 1].governmentFemale +
      teacherData[teacherData.length - 1].governmentAidedMale + teacherData[teacherData.length - 1].governmentAidedFemale
    : 0;

  const hasTeacherData = teacherData.length > 0;
  const hasAgeData = ageChartData.some(d => d.teachers > 0);
  const hasServiceData = serviceChartData.some(d => d.teachers > 0);

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
      </div>

      <ChartCard
        title="Teachers in Primary Schools"
        description="Total number of teachers over time"
        loading={loading}
        error={null}
        empty={!hasTeacherData && !loading}
      >
        {hasTeacherData ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={teacherData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientGovernmentMale" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.7}/>
                </linearGradient>
                <linearGradient id="gradientGovernmentFemale" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#93c5fd" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#93c5fd" stopOpacity={0.6}/>
                </linearGradient>
                <linearGradient id="gradientGovernmentAidedMale" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.7}/>
                </linearGradient>
                <linearGradient id="gradientGovernmentAidedFemale" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5eead4" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#5eead4" stopOpacity={0.6}/>
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
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                }
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="rect"
                iconSize={10}
              />
              <Bar
                dataKey="governmentMale"
                name="Government (Male)"
                fill="url(#gradientGovernmentMale)"
                stackId="government"
                radius={[0, 0, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="governmentFemale"
                name="Government (Female)"
                fill="url(#gradientGovernmentFemale)"
                stackId="government"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="governmentAidedMale"
                name="Government-Aided (Male)"
                fill="url(#gradientGovernmentAidedMale)"
                stackId="aided"
                radius={[0, 0, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="governmentAidedFemale"
                name="Government-Aided (Female)"
                fill="url(#gradientGovernmentAidedFemale)"
                stackId="aided"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState />
        )}
      </ChartCard>

      <ChartCard
        title="Teachers by Age"
        description={`Age distribution of teachers in ${activeFilters.yearEnd}`}
        loading={loading}
        error={null}
        empty={!hasAgeData && !loading}
      >
        {hasAgeData ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={ageChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientAge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="age"
                tick={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                tick={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                }
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
              <Bar
                dataKey="teachers"
                name="Teachers"
                fill="url(#gradientAge)"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState />
        )}
      </ChartCard>

      <ChartCard
        title="Teachers by Length of Service"
        description={`Years of service distribution in ${activeFilters.yearEnd}`}
        loading={loading}
        error={null}
        empty={!hasServiceData && !loading}
      >
        {hasServiceData ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={serviceChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientService" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="service"
                tick={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                tick={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                }
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
              <Bar
                dataKey="teachers"
                name="Teachers"
                fill="url(#gradientService)"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState />
        )}
      </ChartCard>
    </div>
  );
}

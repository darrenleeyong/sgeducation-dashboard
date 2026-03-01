"use client";

import { PSLEPerformance } from "./psle-performance";
import { SchoolMetrics } from "./school-metrics";
import { GeneralInfo } from "./general-info";
import { Separator } from "@/components/ui/separator";
import { ChartCard } from "./chart-card";

export function PrimaryDashboard() {
  return (
    <div className="space-y-8">
      <section id="psle-performance">
        <h2 className="uppercase text-lg font-semibold mb-3">PSLE Performance</h2>
        <PSLEPerformance />
      </section>

      <Separator />

      <section id="school-metrics">
        <h2 className="uppercase text-lg font-semibold mb-3">
          School Metrics &amp; Demographics
        </h2>
        <SchoolMetrics />
      </section>

      <Separator />

      <section id="general-info" className="w-full">
        <h2 className="uppercase text-lg font-semibold mb-3">
          General Info &amp; Staffing
        </h2>
        <GeneralInfo />
      </section>
    </div>
  );
}

"use client";

import { PSLEPerformance } from "./psle-performance";
import { SchoolMetrics } from "./school-metrics";
import { GeneralInfo } from "./general-info";
import { Separator } from "@/components/ui/separator";

export function PrimaryDashboard() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-3">PSLE Performance</h2>
        <PSLEPerformance />
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-3">
          School Metrics &amp; Demographics
        </h2>
        <SchoolMetrics />
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-3">
          General Info &amp; Staffing
        </h2>
        <GeneralInfo />
      </section>
    </div>
  );
}

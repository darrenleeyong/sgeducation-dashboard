"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { FilterBar } from "@/components/filters/filter-bar";
import { PrimaryDashboard } from "@/components/dashboard/primary-dashboard";
import { ComingSoon } from "@/components/navigation/coming-soon";
import { TAB_VALUES, TAB_LABELS } from "@/types";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              SG Education Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Singapore Primary School Data Analytics
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="primary" className="w-full">
        <div className="border-b">
          <div className="mx-auto max-w-7xl px-4">
            <TabsList className="h-auto bg-transparent p-0 gap-0">
              {TAB_VALUES.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  {TAB_LABELS[tab]}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {/* Primary Tab */}
        <TabsContent value="primary" className="mt-0">
          <FilterBar />
          <main className="mx-auto max-w-7xl px-4 py-6">
            <PrimaryDashboard />
          </main>
        </TabsContent>

        {/* Coming Soon Tabs */}
        {TAB_VALUES.filter((t) => t !== "primary").map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0">
            <main className="mx-auto max-w-7xl px-4 py-6">
              <ComingSoon label={`${TAB_LABELS[tab]} Dashboard`} />
            </main>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

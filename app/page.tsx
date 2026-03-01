"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { FilterBar } from "@/components/filters/filter-bar";
import { PrimaryDashboard } from "@/components/dashboard/primary-dashboard";
import { ComingSoon } from "@/components/navigation/coming-soon";
import { TAB_VALUES, TAB_LABELS } from "@/types";
import { GraduationCap, Building2, School, BookOpen, University, Menu, X } from "lucide-react";

const TAB_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  primary: GraduationCap,
  secondary: Building2,
  jc: School,
  polytechnic: BookOpen,
  university: University,
};

function Sidebar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  return (
    <aside className="group w-16 hover:w-64 flex-shrink-0 border-r border-border bg-background/80 backdrop-blur-md sticky top-0 h-screen overflow-hidden transition-all duration-300">
      <div className="p-4 min-w-[240px] h-full">
        {/* Header in sidebar */}
        <div className="flex items-center gap-3 mb-6">
          <GraduationCap className="h-7 w-7 text-primary flex-shrink-0" />
          <span className="whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              SG Education Dashboard
            </h1>
          </span>
        </div>

        {/* Theme toggle */}
        <div className="mb-4">
          <div className="overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
            <ThemeToggle />
          </div>
        </div>

        {/* Navigation tabs - vertical */}
        <nav className="flex flex-col gap-1">
          {TAB_VALUES.map((tab) => {
            const Icon = TAB_ICONS[tab];
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium justify-start transition-colors ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0 min-w-[20px]" />
                <span className="whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
                  {TAB_LABELS[tab]}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md hover:bg-accent"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function MobileMenu({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm pt-14">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-7 w-7 text-primary flex-shrink-0" />
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              SG Education Dashboard
            </h1>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-accent"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-2">
          {TAB_VALUES.map((tab) => {
            const Icon = TAB_ICONS[tab];
            return (
              <button
                key={tab}
                onClick={() => {
                  onTabChange(tab);
                  onClose();
                }}
                className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium justify-start ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {TAB_LABELS[tab]}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function TabContent({ activeTab }: { activeTab: string }) {
  return (
    <Tabs value={activeTab}>
      <TabsContent value="primary" className="mt-0">
        <FilterBar />
        <PrimaryDashboard />
      </TabsContent>

      {TAB_VALUES.filter((t) => t !== "primary").map((tab) => (
        <TabsContent key={tab} value={tab} className="mt-0">
          <ComingSoon label={`${TAB_LABELS[tab]} Dashboard`} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("primary");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile: Header with hamburger (below 600px) */}
      <div className="sm:hidden">
        <MobileHeader onMenuClick={() => setMobileMenuOpen(true)} />
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Desktop: Sidebar layout (600px and above) */}
      <div className="hidden sm:flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <TabContent activeTab={activeTab} />
          </div>
        </main>
      </div>

      {/* Mobile: Simple layout (below 600px) */}
      <div className="sm:hidden">
        <TabContent activeTab={activeTab} />
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { FilterBar } from "@/components/filters/filter-bar";
import { PrimaryDashboard } from "@/components/dashboard/primary-dashboard";
import { ComingSoon } from "@/components/navigation/coming-soon";
import { TAB_VALUES, TAB_LABELS } from "@/types";
import { GraduationCap, Building2, School, BookOpen, University, Menu, X, Github } from "lucide-react";

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
      <div className="p-4 min-w-[240px] h-full flex flex-col">
        {/* Header in sidebar */}
        <div className="flex items-center gap-3 mb-6">
          <GraduationCap className="h-7 w-7 text-primary flex-shrink-0" />
          <span className="overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
            <h1 className="text-xl font-bold tracking-tight text-foreground whitespace-normal leading-tight">
              SG EduStats
            </h1>
          </span>
        </div>

        {/* Navigation tabs - vertical */}
        <nav className="flex flex-col gap-1 flex-1">
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
                <span className="uppercase whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
                  {TAB_LABELS[tab]}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border">
          {/* Theme toggle - always visible */}
          <div className="mb-3">
            <ThemeToggle />
          </div>
          {/* Credits - visible on hover */}
          <div className="overflow-hidden">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Data from <a href="https://data.gov.sg" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">data.gov.sg</a></p>
                <p>Built by <a href="https://darrenlee.framer.website/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Darren Lee</a></p>
                <p>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    <Github className="h-3 w-3" />
                    View on GitHub
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
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
              SG EduStats
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
                className={`uppercase flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium justify-start ${
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
        <div className="max-w-5xl mx-auto p-6">
          <PrimaryDashboard />
        </div>
      </TabsContent>

      {TAB_VALUES.filter((t) => t !== "primary").map((tab) => (
        <TabsContent key={tab} value={tab} className="mt-0">
          <main className="max-w-5xl mx-auto p-6">
            <ComingSoon label={`${TAB_LABELS[tab]} Dashboard`} />
          </main>
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("primary");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Sticky Header - Full Width */}
          <div
            className={`sticky top-0 z-40 transition-all duration-200 ${
              scrolled ? "z-50 shadow-lg" : ""
            } bg-background/95 backdrop-blur-md border-b border-border`}
          >
            <FilterBar />
            {/* Section Navigation */}
            <div className="max-w-7xl mx-auto px-6">
              <nav className="flex gap-1 py-2 overflow-x-auto scrollbar-hide">
                {["psle-performance", "school-metrics", "general-info"].map((id, index) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="uppercase px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md whitespace-nowrap transition-colors"
                  >
                    {["PSLE Performance", "School Metrics", "General Info"][index]}
                  </a>
                ))}
              </nav>
            </div>
          </div>
          {/* Scrollable Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              <TabContent activeTab={activeTab} />
            </div>
          </main>
        </div>
      </div>

      {/* Mobile: Simple layout (below 600px) */}
      <div className="sm:hidden">
        <TabContent activeTab={activeTab} />
      </div>
    </div>
  );
}

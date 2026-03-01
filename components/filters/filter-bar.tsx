"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilterStore } from "@/lib/store";
import { YEAR_OPTIONS } from "@/types";
import { SlidersHorizontal } from "lucide-react";

export function FilterBar() {
  const { pendingFilters, setPendingFilter, applyFilters } = useFilterStore();

  return (
    <div className="border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />

          {/* Year Start */}
          <Select
            value={String(pendingFilters.yearStart)}
            onValueChange={(v) => setPendingFilter("yearStart", Number(v))}
          >
            <SelectTrigger className="w-[110px] shrink-0 bg-muted border-border text-foreground">
              <SelectValue placeholder="From" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground">
              {YEAR_OPTIONS.filter((y) => y <= pendingFilters.yearEnd).map(
                (y) => (
                  <SelectItem key={y} value={String(y)} className="focus:bg-accent focus:text-accent-foreground">
                    {y}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          <span className="text-muted-foreground text-sm shrink-0">to</span>

          {/* Year End */}
          <Select
            value={String(pendingFilters.yearEnd)}
            onValueChange={(v) => setPendingFilter("yearEnd", Number(v))}
          >
            <SelectTrigger className="w-[110px] shrink-0 bg-muted border-border text-foreground">
              <SelectValue placeholder="To" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground">
              {YEAR_OPTIONS.filter((y) => y >= pendingFilters.yearStart).map(
                (y) => (
                  <SelectItem key={y} value={String(y)} className="focus:bg-accent focus:text-accent-foreground">
                    {y}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          <div className="ml-auto shrink-0">
            <Button
              onClick={applyFilters}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

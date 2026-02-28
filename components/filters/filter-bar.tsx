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
import { YEAR_OPTIONS, SCHOOL_LEVELS, RACES, SUBJECTS } from "@/types";
import { SlidersHorizontal } from "lucide-react";

export function FilterBar() {
  const { pendingFilters, setPendingFilter, applyFilters } = useFilterStore();

  return (
    <div className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />

          {/* Year Start */}
          <Select
            value={String(pendingFilters.yearStart)}
            onValueChange={(v) => setPendingFilter("yearStart", Number(v))}
          >
            <SelectTrigger className="w-[110px] shrink-0">
              <SelectValue placeholder="From" />
            </SelectTrigger>
            <SelectContent>
              {YEAR_OPTIONS.filter((y) => y <= pendingFilters.yearEnd).map(
                (y) => (
                  <SelectItem key={y} value={String(y)}>
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
            <SelectTrigger className="w-[110px] shrink-0">
              <SelectValue placeholder="To" />
            </SelectTrigger>
            <SelectContent>
              {YEAR_OPTIONS.filter((y) => y >= pendingFilters.yearStart).map(
                (y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          {/* School Level */}
          <Select
            value={pendingFilters.schoolLevel}
            onValueChange={(v) => setPendingFilter("schoolLevel", v)}
          >
            <SelectTrigger className="w-[120px] shrink-0">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              {SCHOOL_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level === "all" ? "All Levels" : level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Race */}
          <Select
            value={pendingFilters.race}
            onValueChange={(v) => setPendingFilter("race", v)}
          >
            <SelectTrigger className="w-[130px] shrink-0">
              <SelectValue placeholder="Race" />
            </SelectTrigger>
            <SelectContent>
              {RACES.map((race) => (
                <SelectItem key={race} value={race}>
                  {race === "all" ? "All Races" : race}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Subject */}
          <Select
            value={pendingFilters.subject}
            onValueChange={(v) => setPendingFilter("subject", v)}
          >
            <SelectTrigger className="w-[140px] shrink-0">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((subj) => (
                <SelectItem key={subj} value={subj}>
                  {subj === "all" ? "All Subjects" : subj}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="ml-auto shrink-0">
            <Button
              onClick={applyFilters}
              className="bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

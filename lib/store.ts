"use client";

import { create } from "zustand";
import { FilterState, DEFAULT_FILTERS } from "@/types";

interface FilterStore {
  pendingFilters: FilterState;
  activeFilters: FilterState;
  applyTrigger: number;
  setPendingFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void;
  applyFilters: () => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  pendingFilters: { ...DEFAULT_FILTERS },
  activeFilters: { ...DEFAULT_FILTERS },
  applyTrigger: 0,

  setPendingFilter: (key, value) =>
    set((state) => ({
      pendingFilters: { ...state.pendingFilters, [key]: value },
    })),

  applyFilters: () =>
    set((state) => ({
      activeFilters: { ...state.pendingFilters },
      applyTrigger: state.applyTrigger + 1,
    })),

  resetFilters: () =>
    set({
      pendingFilters: { ...DEFAULT_FILTERS },
      activeFilters: { ...DEFAULT_FILTERS },
    }),
}));

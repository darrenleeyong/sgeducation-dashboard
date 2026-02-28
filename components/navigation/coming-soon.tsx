"use client";

import { Construction } from "lucide-react";

export function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
        <Construction className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-semibold mb-2">{label}</h2>
        <p className="text-muted-foreground max-w-sm">
          This section is under development. Check back soon for updates.
        </p>
      </div>
    </div>
  );
}

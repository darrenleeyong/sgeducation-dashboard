"use client";

import { Construction } from "lucide-react";

export function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative rounded-2xl border border-border bg-muted/30 p-12 text-center backdrop-blur-md shadow-sm">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-muted/30 via-transparent to-muted/30 pointer-events-none" />
        <Construction className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-semibold mb-2 text-foreground">{label}</h2>
        <p className="text-muted-foreground max-w-sm">
          This section is under development. Check back soon for updates.
        </p>
      </div>
    </div>
  );
}

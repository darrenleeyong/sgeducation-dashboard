"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, FileX } from "lucide-react";
import { type ReactNode } from "react";

interface ChartCardProps {
  title: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  children?: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  loading,
  error,
  empty,
  children,
  className,
}: ChartCardProps) {
  return (
    <Card className={`bg-card border-border shadow-sm ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-card-foreground">{title}</CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-[250px] w-full rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
            <AlertCircle className="h-8 w-8 mb-2 text-destructive" />
            <p className="text-sm text-center">{error}</p>
          </div>
        ) : empty ? (
          <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
            <FileX className="h-10 w-10 mb-3 opacity-50" />
            <p className="text-sm font-medium">No data available</p>
            <p className="text-xs opacity-70">Try adjusting your filters</p>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

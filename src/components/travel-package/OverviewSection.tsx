"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import type { TravelPackageOverview } from "@/components/travel-package/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export function OverviewSection({ overview }: { overview: TravelPackageOverview }) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Overview</CardTitle>
        <Button
          type="button"
          variant="outline"
          className="h-9"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : "Read more"}
          <ChevronDown className={cn("h-4 w-4 transition", expanded && "rotate-180")} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed text-slate-700">{overview.short}</p>
        {expanded ? (
          <p className="text-sm leading-relaxed text-slate-700">{overview.long}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}


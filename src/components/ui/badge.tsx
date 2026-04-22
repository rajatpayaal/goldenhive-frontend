import * as React from "react";

import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "secondary" | "success" | "outline";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  const variantClass =
    variant === "secondary"
      ? "bg-slate-100 text-slate-700"
      : variant === "success"
        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
        : variant === "outline"
          ? "border border-slate-200 text-slate-700"
          : "bg-purple-600 text-white";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variantClass,
        className
      )}
      {...props}
    />
  );
}


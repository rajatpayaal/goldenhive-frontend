"use client";

import { Search } from "lucide-react";
import { GlobalSearch } from "@/components/GlobalSearch";

export function HomeHeroSearch({ className = "" }) {
  return (
    <div
      className={[
        "relative flex w-full items-center rounded-full bg-white",
        "shadow-[0_8px_40px_rgba(0,0,0,0.28)] ring-1 ring-white/30",
        className,
      ].join(" ")}
    >
      {/* Search icon */}
      <div className="flex shrink-0 items-center pl-5">
        <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
      </div>

      {/* Search input — naked variant (no inner border/bg) */}
      <div className="min-w-0 flex-1 px-3 py-1">
        <GlobalSearch variant="hero-naked" tone="header-light" />
      </div>

      {/* Search button */}
      <div className="shrink-0 p-1.5">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gh-primary text-slate-900 transition-colors hover:bg-yellow-500 active:scale-[0.97]"
          aria-label="Search"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

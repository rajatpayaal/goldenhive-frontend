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
          className="rounded-full bg-gh-gold px-7 py-3 text-sm font-black text-gh-plum transition-colors hover:bg-gh-gold2 active:scale-[0.97]"
        >
          Search
        </button>
      </div>
    </div>
  );
}

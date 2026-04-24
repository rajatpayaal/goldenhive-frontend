"use client";

import { GlobalSearch } from "@/components/GlobalSearch";

export function HomeHeroSearch({ className = "" }) {
  return (
    <form
      className={[
        "w-full rounded-2xl border border-gh-gold/20 bg-white p-3 text-slate-900 shadow-gh-soft md:rounded-[1.7rem] md:p-4",
        className,
      ].join(" ")}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <div className="md:grid-cols-[1.45fr_0.8fr_0.8fr_0.85fr] md:items-center">
        <div className="rounded-2xl bg-transparent px-4 py-3">
          <GlobalSearch variant="hero" tone="header-light" />
        </div>
      </div>
    </form>
  );
}

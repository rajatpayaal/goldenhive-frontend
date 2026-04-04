"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

export function FooterTabs({ tabs }) {
  const safeTabs = useMemo(() => (tabs || []).filter((t) => t?.isActive), [tabs]);
  const [activeTab, setActiveTab] = useState(0);

  if (safeTabs.length === 0) return null;

  const safeActiveTab = Math.min(activeTab, Math.max(0, safeTabs.length - 1));
  const currentTab = safeTabs[safeActiveTab];

  return (
    <div className="rounded-3xl border border-white/10 bg-gray/5 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm font-extrabold uppercase tracking-wider text-white/80">
            Browse by category
          </div>
          <div className="mt-1 text-xs font-semibold text-white/55">
            (names later; abhi IDs)
          </div>
        </div>
        <Link className="text-sm font-black text-emerald-300 hover:text-emerald-200" href="#packages">
          View all
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {safeTabs.map((tab, idx) => (
          <button
            key={tab.categoryId || idx}
            className={[
              "rounded-full px-4 py-2 text-sm font-extrabold transition",
              idx === safeActiveTab
                ? "bg-white text-slate-950"
                : "border border-white/10 bg-white/5 text-white hover:bg-white/10",
            ].join(" ")}
            onClick={() => setActiveTab(idx)}
            type="button"
          >
            {tab.categoryId}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {(currentTab?.packageIds || []).map((pkgId) => (
          <Link
            key={pkgId}
            href={`/package/${pkgId}`}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 hover:border-emerald-300/30 hover:bg-emerald-500/10 hover:text-white"
          >
            {pkgId}
          </Link>
        ))}
        {(currentTab?.packageIds || []).length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/60">
            No links yet.
          </div>
        )}
      </div>
    </div>
  );
}


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
    <div className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between mb-5">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-[0.32em] text-white/60">
            Curated Categories
          </div>
          <div className="mt-2 text-xl font-black text-white sm:text-2xl">Explore by vibe</div>
        </div>
        <Link
          className="inline-flex w-fit items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/15 transition"
          href="/packages"
        >
          View All
        </Link>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {/* Category Tabs */}
        {safeTabs.map((tab, idx) => {
          const label = tab.categoryId?.name || tab.categoryId || `Category ${idx + 1}`;
          const key = tab.categoryId?._id || label || idx;

          return (
            <button
              key={key}
              className={[
                "rounded-full px-4 py-2 text-xs font-bold transition",
                idx === safeActiveTab
                  ? "border border-transparent bg-[linear-gradient(90deg,var(--gh-accent),var(--gh-accent-strong))] text-white shadow-[0_4px_14px_rgba(255,79,138,0.3)]"
                  : "border border-white/10 bg-transparent text-white/80 hover:bg-white/5 hover:text-white"
              ].join(" ")}
              onClick={() => setActiveTab(idx)}
              type="button"
            >
              {label}
            </button>
          );
        })}

        {/* Separator / Packages */}
        {((currentTab?.categoryPackages || []).length > 0
          ? currentTab.categoryPackages
          : currentTab?.packageIds || []).map((pkg, idx) => {
          const packageObj = typeof pkg === "string" ? { id: pkg, name: pkg } : pkg;
          const packageId = packageObj.packageCode || packageObj._id || packageObj.id || `pkg-${idx}`;
          const packageName = packageObj.basic?.name || packageObj.name || packageObj.slug || packageId;
          const href = packageObj.basic?.slug ? `/packages/${packageObj.basic.slug}` : `/packages/${packageId}`;

          return (
            <Link
              key={packageId}
              href={href}
              className="inline-flex rounded-full border border-white/10 bg-transparent px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              {packageName}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

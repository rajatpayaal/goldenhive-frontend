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
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 shadow-[0_24px_50px_rgba(8,15,31,0.2)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-[0.32em] text-white/60">
            Curated Categories
          </div>
          <div className="mt-2 text-xl font-black text-white sm:text-2xl">Explore by vibe</div>
        </div>
        <Link
          className="inline-flex w-fit items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/15"
          href="/packages"
        >
          View all
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {safeTabs.map((tab, idx) => {
          const label = tab.categoryId?.name || tab.categoryId || `Category ${idx + 1}`;
          const key = tab.categoryId?._id || label || idx;

          return (
            <button
              key={key}
              className={[
                "rounded-full px-4 py-2 text-sm font-extrabold transition",
                idx === safeActiveTab
                  ? "border border-white/15 bg-[linear-gradient(90deg,var(--gh-accent),var(--gh-accent-strong))] text-white shadow-[0_14px_30px_rgba(255,79,138,0.22)]"
                  : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
              ].join(" ")}
              onClick={() => setActiveTab(idx)}
              type="button"
            >
            {label}
          </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
              className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 hover:border-white/15 hover:bg-white/10 hover:text-white"
            >
              {packageName}
            </Link>
          );
        })}
        {((currentTab?.categoryPackages || []).length === 0 && (currentTab?.packageIds || []).length === 0) && (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/60">
            No links yet.
          </div>
        )}
      </div>
    </div>
  );
}

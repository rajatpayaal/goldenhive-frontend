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
    <div className="border border-white/10 bg-gray/5 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm font-extrabold uppercase tracking-wider text-white/80">
             category
          </div>
        </div>
        <Link className="text-sm font-black text-emerald-300 hover:text-emerald-200" href="/tour-packages">
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
                "px-4 py-2 text-sm font-extrabold transition",
                idx === safeActiveTab
              ?"border border-emerald-300 bg-emerald-500/10 text-white"
              : "text-white/80 hover:bg-white/10"
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
          const href = packageObj.basic?.slug ? `/package/${packageObj.basic.slug}` : `/package/${packageId}`;

          return (
            <Link
              key={packageId}
              href={href}
              className="text-sm font-semibold text-white/80 hover:text-emerald-300"
            >
              {packageName}
            </Link>
          );
        })}
        {((currentTab?.categoryPackages || []).length === 0 && (currentTab?.packageIds || []).length === 0) && (
          <div className="border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/60">
            No links yet.
          </div>
        )}
      </div>
    </div>
  );
}


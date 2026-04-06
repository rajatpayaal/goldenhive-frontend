"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

const getPackageImage = (pkg) => {
  return (
    pkg.images?.primary?.url ||
    pkg.images?.gallery?.[0]?.url ||
    pkg.hero?.image ||
    pkg.hero?.primaryImage ||
    "/placeholder.jpg"
  );
};

const formatDuration = (pkg) => {
  const { durationDays, nights } = pkg.basic || {};
  if (durationDays != null || nights != null) {
    return `${durationDays ?? "-"}D / ${nights ?? "-"}N`;
  }
  return "Duration TBA";
};

const formatInr = (value) => {
  const numeric = typeof value === "string" && value.trim() === "" ? NaN : Number(value);
  if (Number.isFinite(numeric)) {
    return numeric.toLocaleString("en-IN");
  }
  return value ?? "TBA";
};

const calcSavings = ({ basePrice, finalPrice, discountPercent }) => {
  const base = Number(basePrice);
  const final = Number(finalPrice);
  if (Number.isFinite(base) && Number.isFinite(final) && base > final) {
    return base - final;
  }
  // Fallback: derive from discountPercent when possible.
  const pct = Number(discountPercent);
  if (Number.isFinite(base) && Number.isFinite(pct) && pct > 0) {
    return Math.round((base * pct) / 100);
  }
  return null;
};

export function PackagesCarousel({ packages, autoSlide = true, intervalMs = 3500 }) {
  const scrollerRef = useRef(null);
  const [paused, setPaused] = useState(false);

  const safePackages = useMemo(() => (packages || []).filter(Boolean), [packages]);

  useEffect(() => {
    if (!autoSlide) return;
    if (paused) return;
    const el = scrollerRef.current;
    if (!el) return;
    if (safePackages.length <= 1) return;

    const tick = () => {
      const card = el.querySelector("[data-card]");
      const step = card ? card.getBoundingClientRect().width + 20 : 340; // width + gap
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      const next = Math.min(el.scrollLeft + step, maxScrollLeft);

      if (next >= maxScrollLeft - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }
      el.scrollTo({ left: next, behavior: "smooth" });
    };

    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [autoSlide, intervalMs, paused, safePackages.length]);

  if (safePackages.length === 0) return null;

  return (
    <div
      ref={scrollerRef}
      className="no-scrollbar mt-7 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={() => setPaused(true)}
      onTouchStart={() => setPaused(true)}
    >
      {safePackages.map((pkg, index) => (
        <Link
          href={`/package/${pkg.basic?.slug || pkg._id}`}
          key={pkg._id || pkg.basic?.slug || index}
          className="group relative w-[320px] shrink-0 snap-start overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(2,6,23,0.10)]"
          data-card
        >
          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
              style={{ backgroundImage: `url(${getPackageImage(pkg)})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-transparent" />

            <div className="absolute left-4 top-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-extrabold text-white backdrop-blur">
              {formatDuration(pkg)}
            </div>
          </div>

          <div className="p-6">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              {pkg.basic?.destination || "Uttarakhand"}
            </div>
            <h3 className="mt-2 line-clamp-2 text-lg font-black tracking-tight text-slate-900">
              {pkg.basic?.name || "Untitled journey"}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-600">
              {pkg.basic?.tagline || "Experience the best of the Himalayas."}
            </p>

            <div className="mt-5 flex items-end justify-between gap-4 border-t border-black/5 pt-4">
              <div>
                {pkg.pricing?.discountPercent > 0 && (
                  <>
                    <div className="text-xs font-bold text-slate-400 line-through">
                      ₹{formatInr(pkg.pricing.basePrice)}
                    </div>
                    <div className="mt-1 text-[11px] font-black text-emerald-700">
                      {pkg.pricing.discountPercent}% OFF
                      {(() => {
                        const savings = calcSavings({
                          basePrice: pkg.pricing.basePrice,
                          finalPrice: pkg.pricing.finalPrice ?? pkg.pricing?.finalPrice,
                          discountPercent: pkg.pricing.discountPercent,
                        });
                        return savings ? ` · Save ₹${formatInr(savings)}` : "";
                      })()}
                    </div>
                  </>
                )}
                <div className="flex items-end gap-2">
                  <div className="text-2xl font-black tracking-tight text-slate-900">
                    ₹{formatInr(pkg.pricing?.finalPrice ?? pkg.basic?.finalPrice)}
                  </div>
                  <div className="pb-1 text-xs font-semibold text-slate-500">/ person</div>
                </div>
              </div>
              <span className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white transition group-hover:bg-emerald-600">
                Explore
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

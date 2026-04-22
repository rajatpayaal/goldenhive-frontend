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
  const { durationDays, nights, durationNights } = pkg.basic || {};
  const safeNights = durationNights ?? nights;
  if (durationDays != null || safeNights != null) {
    return `${durationDays ?? "-"}D / ${safeNights ?? "-"}N`;
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
    if (!autoSlide || paused) return;
    const el = scrollerRef.current;
    if (!el || safePackages.length <= 1) return;

    const tick = () => {
      const card = el.querySelector("[data-card]");
      const step = card ? card.getBoundingClientRect().width + 20 : 360;
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
      {safePackages.map((pkg, index) => {
        const savings = calcSavings({
          basePrice: pkg.pricing?.basePrice,
          finalPrice: pkg.pricing?.finalPrice ?? pkg.basic?.finalPrice,
          discountPercent: pkg.pricing?.discountPercent,
        });

        return (
          <Link
            href={`/packages/${pkg.basic?.slug || pkg._id}`}
            key={pkg._id || pkg.basic?.slug || index}
            className="group relative w-[285px] shrink-0 snap-start overflow-hidden rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.95)] shadow-[0_18px_45px_rgba(121,68,44,0.12)] transition hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(255,79,138,0.18)] sm:w-[340px]"
            data-card
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--gh-bg-soft)]">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.08]"
                style={{ backgroundImage: `url(${getPackageImage(pkg)})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(31,41,64,0.48)] via-transparent to-transparent" />

              <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-[linear-gradient(90deg,var(--gh-accent),var(--gh-accent-strong))] px-4 py-2 text-xs font-extrabold text-white shadow-[0_10px_25px_rgba(255,79,138,0.25)]">
                {formatDuration(pkg)}
              </div>

              {pkg?.bestDeal && (
                <div className="absolute right-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-[11px] font-black text-[color:var(--gh-accent)] shadow-sm">
                  Best Deal
                </div>
              )}
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[color:var(--gh-accent)]">
                {pkg.basic?.destination || "Uttarakhand"}
              </div>
              <h3 className="line-clamp-2 text-[1.7rem] font-black leading-[1.02] tracking-tight text-[color:var(--gh-heading)]">
                {pkg.basic?.name || "Untitled journey"}
              </h3>
              <p className="line-clamp-2 text-sm font-medium text-[color:var(--gh-text-soft)]">
                {pkg.basic?.tagline || "Experience the best of the Himalayas."}
              </p>

              <div className="grid grid-cols-3 gap-2 rounded-[1.2rem] border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-3 py-3 text-center text-[11px] font-bold text-[color:var(--gh-text-soft)]">
                <span>Stay</span>
                <span>Meals</span>
                <span>Guide</span>
              </div>

              <div className="flex items-end justify-between gap-4 border-t border-[color:var(--gh-border)] pt-4">
                <div>
                  {pkg.pricing?.discountPercent > 0 && (
                    <>
                      <div className="text-xs font-bold text-[color:var(--gh-text-soft)] line-through">
                        Rs.{formatInr(pkg.pricing.basePrice)}
                      </div>
                      <div className="mt-1 text-[11px] font-black text-[color:var(--gh-accent)]">
                        {pkg.pricing.discountPercent}% OFF
                        {savings ? ` · Save Rs.${formatInr(savings)}` : ""}
                      </div>
                    </>
                  )}
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-black tracking-tight text-[color:var(--gh-accent)]">
                      Rs.{formatInr(pkg.pricing?.finalPrice ?? pkg.basic?.finalPrice)}
                    </div>
                    <div className="pb-1 text-xs font-semibold text-[color:var(--gh-text-soft)]">
                      / person
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(90deg,var(--gh-accent),var(--gh-accent-strong))] px-5 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(255,79,138,0.22)]">
                  Explore
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

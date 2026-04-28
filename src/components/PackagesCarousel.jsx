"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const safePackages = useMemo(() => (packages || []).filter(Boolean), [packages]);

  const checkScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const step = card ? card.getBoundingClientRect().width + 20 : 360;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    
    let next;
    if (direction === "next") {
      next = Math.min(el.scrollLeft + step, maxScrollLeft);
    } else {
      next = Math.max(el.scrollLeft - step, 0);
    }
    
    el.scrollTo({ left: next, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    checkScroll();
    return () => el.removeEventListener("scroll", checkScroll);
  }, []);

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
    <div className="relative">
      {/* Navigation Buttons */}
      <div className="absolute right-16 top-0 z-10 flex gap-2">
        <button
          onClick={() => scroll("prev")}
          disabled={!canScrollLeft}
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--gh-border)] bg-white shadow-md transition-all hover:shadow-lg ${
            canScrollLeft 
              ? "text-[color:var(--gh-accent)] hover:bg-[color:var(--gh-accent)] hover:text-white" 
              : "cursor-not-allowed text-gray-300"
          }`}
          aria-label="Previous packages"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scroll("next")}
          disabled={!canScrollRight}
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--gh-border)] bg-white shadow-md transition-all hover:shadow-lg ${
            canScrollRight 
              ? "text-[color:var(--gh-accent)] hover:bg-[color:var(--gh-accent)] hover:text-white" 
              : "cursor-not-allowed text-gray-300"
          }`}
          aria-label="Next packages"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div
        ref={scrollerRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
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
            className="group relative w-[160px] shrink-0 snap-start overflow-hidden rounded-2xl border border-[color:var(--gh-border)] bg-white shadow-sm transition hover:shadow-md sm:w-[240px]"
            data-card
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${getPackageImage(pkg)})` }}
              />

              {pkg.pricing?.discountPercent > 0 && (
                <div className="absolute left-2 top-2 rounded-full bg-gh-rose px-2 py-0.5 text-[9px] font-black text-white shadow-sm">
                  {pkg.pricing.discountPercent}% OFF
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between p-3 h-[100px] sm:h-auto sm:p-4">
              <h3 className="line-clamp-2 text-xs font-bold leading-tight text-slate-800 sm:text-sm">
                {pkg.basic?.name || "Untitled journey"}
              </h3>

              <div className="mt-2">
                <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                  From
                </div>
                <div className="text-sm font-bold text-gh-rose">
                  Rs.{formatInr(pkg.pricing?.finalPrice ?? pkg.basic?.finalPrice)}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
      </div>
    </div>
  );
}

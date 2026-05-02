"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

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
  if (durationDays != null && safeNights != null) {
    return `${safeNights}N/${durationDays}D`;
  }
  if (durationDays != null) return `${durationDays}D`;
  if (safeNights != null) return `${safeNights}N`;
  return null;
};

const formatInr = (value) => {
  const numeric = typeof value === "string" && value.trim() === "" ? NaN : Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric.toLocaleString("en-IN");
  }
  return null;
};

export function PackagesCarousel({ packages, autoSlide = true, intervalMs = 3500 }) {
  const scrollerRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [wishlist, setWishlist] = useState({});

  const safePackages = useMemo(() => (packages || []).filter(Boolean), [packages]);

  const toggleWishlist = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Auto-slide
  useEffect(() => {
    if (!autoSlide || paused) return;
    const el = scrollerRef.current;
    if (!el || safePackages.length <= 1) return;

    const tick = () => {
      const card = el.querySelector("[data-card]");
      const step = card ? card.getBoundingClientRect().width + 12 : 200;
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
      className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={() => setPaused(true)}
      onTouchStart={() => setPaused(true)}
    >
      {safePackages.map((pkg, index) => {
        const id = pkg._id || pkg.basic?.slug || index;
        const slug = pkg.basic?.slug || pkg._id;
        const imageUrl = getPackageImage(pkg);
        const discount = pkg.pricing?.discountPercent;
        const finalPrice = formatInr(pkg.pricing?.finalPrice ?? pkg.basic?.finalPrice);
        const duration = formatDuration(pkg);
        const stayType = pkg.basic?.stayType || pkg.basic?.packageType || null;
        const destination = pkg.basic?.destination || null;
        const title = pkg.basic?.name || "Untitled Journey";
        const isWishlisted = wishlist[id] || false;

        return (
          <Link
            href={`/packages/${slug}`}
            key={id}
            data-card
            className="group relative flex-shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(17,24,39,0.10)] border border-slate-100 transition-shadow hover:shadow-[0_6px_24px_rgba(17,24,39,0.14)]"
            style={{ width: "clamp(160px, 42vw, 200px)" }}
          >
            {/* ── Image ── */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
              {/* Dark gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />

              {/* Discount badge */}
              {discount > 0 && (
                <div className="absolute left-2 top-2 rounded-full bg-[color:var(--gh-accent)] px-2 py-0.5 text-[9px] font-black text-white shadow-sm">
                  {discount}% OFF
                </div>
              )}

              {/* Wishlist heart */}
              <button
                type="button"
                onClick={(e) => toggleWishlist(e, id)}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition active:scale-90"
                aria-label="Add to wishlist"
              >
                <Heart
                  className={`h-3.5 w-3.5 transition-colors ${
                    isWishlisted
                      ? "fill-[color:var(--gh-accent)] text-[color:var(--gh-accent)]"
                      : "text-slate-500"
                  }`}
                  strokeWidth={2}
                />
              </button>

              {/* Duration badge at bottom-left of image */}
              {duration && (
                <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[8px] font-bold text-white backdrop-blur-sm">
                  {duration}{stayType ? ` • ${stayType}` : ""}
                </div>
              )}
            </div>

            {/* ── Card Body ── */}
            <div className="flex flex-col gap-1.5 p-2.5">
              {/* Destination */}
              {destination && (
                <p className="truncate text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
                  {destination}
                </p>
              )}

              {/* Title */}
              <h3 className="line-clamp-2 text-[11px] font-bold leading-tight text-slate-800">
                {title}
              </h3>

              {/* Price + Explore */}
              <div className="mt-0.5 flex items-end justify-between gap-1">
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-widest text-slate-400">
                    From
                  </p>
                  <p className="text-[13px] font-black leading-tight text-[color:var(--gh-accent)]">
                    {finalPrice ? `₹${finalPrice}` : "TBA"}
                  </p>
                </div>
                <div className="gh-secondary-btn px-3 py-1.5 text-[9px] font-black shrink-0">
                  Explore
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

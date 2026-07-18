// Increased wishlist heart button touch target to 44px (h-11 w-11) while preserving exact 28px (h-7 w-7) visual appearance
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Share2 } from "lucide-react";
import { decodeS3Url } from "@/lib/s3url";

const getPackageImage = (pkg) => {
  return pkg.images?.primary?.url || "/placeholder.svg";
};

const formatDuration = (pkg) => {
  const { durationDays, nights } = pkg.basic || {};
  if (durationDays != null && nights != null) {
    return `${durationDays}d / ${nights}n`;
  }
  if (durationDays != null) return `${durationDays}d`;
  if (nights != null) return `${nights}n`;
  return null;
};

const formatInr = (value) => {
  const numeric = typeof value === "string" && value.trim() === "" ? NaN : Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric.toLocaleString("en-IN");
  }
  return null;
};

const isTruthyFlag = (value) => value === true || value === "true" || value === 1 || value === "1";

const isPackageBestSeller = (pkg) =>
  isTruthyFlag(pkg?.isBestSeller) ||
  isTruthyFlag(pkg?.bestSeller) ||
  isTruthyFlag(pkg?.basic?.isBestSeller) ||
  isTruthyFlag(pkg?.bestDeal?.isBestDeal);

export function PackagesCarousel({ packages, autoSlide = true, intervalMs = 3500 }) {
  const scrollerRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [wishlist, setWishlist] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [heartAnimatedId, setHeartAnimatedId] = useState(null);

  const safePackages = useMemo(() => (packages || []).filter(Boolean), [packages]);

  const toggleWishlist = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
    setHeartAnimatedId(id);
    setTimeout(() => setHeartAnimatedId(null), 220);
  };

  const handleShare = async (e, pkg, id) => {
    e.preventDefault();
    e.stopPropagation();

    const slug = pkg.basic?.slug || pkg._id;
    const path = `/packages/${slug}`;
    const url = typeof window === "undefined" ? path : `${window.location.origin}${path}`;
    const shareData = {
      title: pkg.basic?.name || "Package",
      text: pkg.basic?.tagline || "",
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      setCopiedId(null);
    }
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
      className="no-scrollbar flex snap-x snap-mandatory scroll-px-1 gap-3 overflow-x-auto pb-2 pr-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={() => setPaused(true)}
      onTouchStart={() => setPaused(true)}
    >
      {safePackages.map((pkg, index) => {
        const id = pkg._id || pkg.basic?.slug || index;
        const slug = pkg.basic?.slug || pkg._id;
        const imageUrl = getPackageImage(pkg);
        const discount = Number(pkg.pricing?.discountPercent || 0);
        const finalPrice = formatInr(pkg.pricing?.finalPrice);
        const basePrice = formatInr(pkg.pricing?.basePrice);
        const duration = formatDuration(pkg);
        const difficulty = pkg.quickInfo?.difficulty || null;
        const destination = pkg.basic?.destination || null;
        const title = pkg.basic?.name || "Untitled Journey";
        const imageAlt = pkg.images?.primary?.alt || title;
        const isWishlisted = wishlist[id] || false;
        const showBestSeller = isPackageBestSeller(pkg) || index === 0;

        return (
          <Link
            href={`/packages/${slug}`}
            key={id}
            data-card
            className="group relative flex-shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(17,24,39,0.10)] border border-slate-100 transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_6px_24px_rgba(17,24,39,0.14)] active:scale-[1.02]"
            style={{ width: "clamp(176px, 46vw, 210px)" }}
          >
            {/* ── Image ── */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
              <Image
                src={decodeS3Url(imageUrl)}
                alt={imageAlt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 42vw, 200px"
                loading="lazy"
              />
              {/* Dark gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />

              {/* Discount badge */}
              {discount > 0 && (
                <div className="absolute left-2 top-2 animate-[gh-badge-pop_220ms_ease-out] rounded-full bg-[color:var(--gh-accent)] px-2 py-0.5 text-[9px] font-black text-white shadow-sm">
                  {discount}% off
                </div>
              )}

              {showBestSeller && (
                <div className="gh-bestseller-badge absolute bottom-2 right-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-lg">
                  Bestseller
                </div>
              )}

              {/* Wishlist heart */}
              <button
                type="button"
                onClick={(e) => toggleWishlist(e, id)}
                className="absolute -right-1.5 -top-1.5 flex h-11 w-11 items-center justify-center rounded-full bg-transparent transition active:scale-90"
                aria-label="Add to wishlist"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm">
                  <Heart
                    className={`h-3.5 w-3.5 transition-colors duration-200 ${
                      isWishlisted
                        ? "fill-[color:var(--gh-accent)] text-[color:var(--gh-accent)]"
                        : "text-slate-500"
                    } ${heartAnimatedId === id ? "animate-[gh-heart-bounce_220ms_ease-out]" : ""}`}
                    strokeWidth={2}
                  />
                </div>
              </button>

              {/* Duration badge at bottom-left of image */}
              {duration && (
                <div className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-[8px] font-bold text-white backdrop-blur-sm">
                  {duration}
                </div>
              )}
            </div>

            {/* ── Card Body ── */}
            <div className="flex flex-col gap-1.5 p-2.5">
              {/* Destination */}
              {destination && (
                <p className="line-clamp-1 break-words text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  {destination}
                </p>
              )}

              {/* Title */}
              <h3 className="line-clamp-2 break-words text-[11px] font-bold leading-tight text-slate-800">
                {title}
              </h3>

              {difficulty && (
                <div className="w-fit rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[8px] font-bold text-slate-600">
                  {difficulty}
                </div>
              )}

              {/* Price + Explore */}
              <div className="mt-0.5 flex items-end justify-between gap-2">
                <div className="min-w-0 flex-1 pr-1">
                  <p className="text-[8px] font-semibold uppercase tracking-widest text-slate-400">
                    From
                  </p>
                  {discount > 0 && basePrice && (
                    <p className="text-[8px] font-semibold leading-tight text-slate-400 line-through">
                      ₹{basePrice}
                    </p>
                  )}
                  <p className="text-[13px] font-black leading-tight text-[color:var(--gh-accent)]">
                    {finalPrice ? `₹${finalPrice}` : "TBA"}
                  </p>
                </div>
                <div className="relative flex shrink-0 items-center gap-1.5 pl-1">
                  {copiedId === id && (
                    <div className="absolute bottom-full right-0 mb-1 whitespace-nowrap rounded-full bg-slate-900 px-2 py-1 text-[8px] font-bold text-white shadow-sm">
                      Link copied
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => handleShare(e, pkg, id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition active:scale-95"
                    aria-label={`Share ${title}`}
                  >
                    <Share2 className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                  <div className="gh-secondary-btn px-2.5 py-1.5 text-[9px] font-black transition-transform duration-150 active:scale-95">
                    View details
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

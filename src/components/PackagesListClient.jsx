"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { decodeS3Url } from "@/lib/s3url";
import {
  ArrowLeft,
  Heart,
  Search,
  Calendar,
  BedDouble,
  Play,
  ChevronDown,
  Tag,
  Gift,
} from "lucide-react";

/* ─── helpers ─────────────────────────────────────────────────── */
const getImage = (pkg) =>
  pkg?.images?.primary?.url ||
  pkg?.images?.gallery?.[0]?.url ||
  pkg?.hero?.image ||
  pkg?.hero?.primaryImage ||
  "/placeholder.svg";

const galleryCount = (pkg) =>
  (pkg?.images?.gallery?.length ?? 0) + (pkg?.images?.primary ? 1 : 0);

const fmtInr = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n.toLocaleString("en-IN") : null;
};

const fmtDuration = (pkg) => {
  const d = pkg?.basic?.durationDays;
  const n = pkg?.basic?.durationNights ?? pkg?.basic?.nights;
  if (d && n) return `${n}N/${d}D`;
  if (d) return `${d}D`;
  if (n) return `${n}N`;
  return null;
};

const SORT_OPTIONS = [
  { label: "Popular", value: "popular" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest", value: "newest" },
];

/* ─── main component ──────────────────────────────────────────── */
export function PackagesListClient({ packages = [], categories = [], title = "All Packages", subtitle = "", activeCategorySlug = null }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [wishlist, setWishlist] = useState({});
  const [showSort, setShowSort] = useState(false);

  const toggleWishlist = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((p) => ({ ...p, [id]: !p[id] }));
  };

  /* search + sort only (category filter is server-side via navigation) */
  const filtered = useMemo(() => {
    let list = [...packages];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (pkg) =>
          pkg?.basic?.name?.toLowerCase().includes(q) ||
          pkg?.basic?.destination?.toLowerCase().includes(q)
      );
    }

    if (sortBy === "price_asc")
      list.sort((a, b) => (a.pricing?.finalPrice ?? 0) - (b.pricing?.finalPrice ?? 0));
    else if (sortBy === "price_desc")
      list.sort((a, b) => (b.pricing?.finalPrice ?? 0) - (a.pricing?.finalPrice ?? 0));
    else if (sortBy === "newest")
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return list;
  }, [packages, search, sortBy]);

  const activeLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Popular";

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FB]">

      {/* ── Mobile Header ── */}
      <div className="sticky top-0 z-30 bg-white shadow-[0_1px_8px_rgba(17,24,39,0.06)] md:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 transition active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4 text-slate-700" strokeWidth={2} />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-extrabold leading-tight text-slate-900">
              {title}
            </h1>
            {subtitle && (
              <p className="truncate text-[10px] text-slate-500">{subtitle}</p>
            )}
          </div>


        </div>
      </div>

      {/* ── Desktop Header ── */}
      <div className="hidden md:block bg-white border-b border-slate-100 px-6 py-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-black text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
        </div>
      </div>

      <div className="flex-1 px-4 pb-32 pt-4 md:mx-auto md:max-w-6xl md:px-6 md:pb-10 md:pt-6">

        {/* ── Search Bar ── */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search packages, destinations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-[color:var(--gh-accent)] focus:ring-2 focus:ring-[color:var(--gh-accent-soft)]"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[color:var(--gh-accent)] shadow-sm"
          >
            <Search className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Category Filter Chips (navigate to category page for server-side filtering) ── */}
        {categories.length > 0 && (
          <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
            {/* All packages chip */}
            <button
              type="button"
              onClick={() => router.push("/packages")}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-bold transition ${
                !activeCategorySlug
                  ? "bg-[color:var(--gh-accent)] text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              <span className="text-xs">⊞</span> All packages
            </button>

            {/* Category chips — navigate to /{slug} */}
            {categories.map((cat) => {
              const isActive = activeCategorySlug === cat.slug;
              return (
                <button
                  key={cat._id || cat.slug}
                  type="button"
                  onClick={() => router.push(`/${cat.slug}`)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-bold transition ${
                    isActive
                      ? "bg-[color:var(--gh-accent)] text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  🏔 {cat.name}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Results count + Sort ── */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[12px] font-semibold text-slate-600">
            <span className="font-black text-slate-900">{filtered.length}</span> Packages Found
          </p>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSort((p) => !p)}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm"
            >
              Sort by: <span className="text-[color:var(--gh-accent)]">{activeLabel}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
            {showSort && (
              <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                    className={`w-full px-4 py-3 text-left text-[12px] font-semibold transition hover:bg-slate-50 ${
                      sortBy === opt.value ? "text-[color:var(--gh-accent)] font-bold" : "text-slate-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Package Cards ── */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <div className="py-16 text-center text-sm font-semibold text-slate-500">
              No packages found. Try a different search.
            </div>
          )}

          {filtered.map((pkg) => {
            const id = pkg._id;
            const slug = pkg.basic?.slug || id;
            const img = getImage(pkg);
            const discount = pkg.pricing?.discountPercent;
            const finalPrice = fmtInr(pkg.pricing?.finalPrice ?? pkg.basic?.finalPrice);
            const basePrice = fmtInr(pkg.pricing?.basePrice);
            const duration = fmtDuration(pkg);
            const stayType = pkg.basic?.stayType || pkg.basic?.packageType;
            const destination = pkg.basic?.destination;
            const title = pkg.basic?.name || "Package";
            const gallery = galleryCount(pkg);
            const isWishlisted = wishlist[id] || false;

            return (
              <Link
                key={id}
                href={`/packages/${slug}`}
                className="group flex overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(17,24,39,0.08)] transition-shadow hover:shadow-[0_6px_20px_rgba(17,24,39,0.12)]"
              >
                {/* Left: Image */}
                <div className="relative w-[140px] shrink-0 sm:w-[180px] overflow-hidden">
                  <Image
                    src={decodeS3Url(img)}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 140px, 180px"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Discount badge */}
                  {discount > 0 && (
                    <div className="absolute left-2 top-2 rounded-full bg-[color:var(--gh-accent)] px-2 py-0.5 text-[9px] font-black text-white shadow-sm">
                      {discount}% OFF
                    </div>
                  )}

                  {/* Heart */}
                  <button
                    type="button"
                    onClick={(e) => toggleWishlist(e, id)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition active:scale-90"
                    aria-label="Wishlist"
                  >
                    <Heart
                      className={`h-3.5 w-3.5 ${isWishlisted ? "fill-[color:var(--gh-accent)] text-[color:var(--gh-accent)]" : "text-slate-500"}`}
                      strokeWidth={2}
                    />
                  </button>

                  {/* Gallery count */}
                  {gallery > 0 && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 backdrop-blur-sm">
                      <Play className="h-2.5 w-2.5 text-white" strokeWidth={0} fill="white" />
                      <span className="text-[9px] font-bold text-white">Gallery ({gallery})</span>
                    </div>
                  )}
                </div>

                {/* Right: Details */}
                <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
                  {/* Top section */}
                  <div>
                    {destination && (
                      <p className="mb-0.5 truncate text-[9px] font-bold uppercase tracking-widest text-[color:var(--gh-accent)]">
                        {destination}
                      </p>
                    )}
                    <h2 className="line-clamp-2 text-[13px] font-extrabold leading-tight text-slate-900">
                      {title}
                    </h2>

                    {/* Duration + Stay type badges */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {duration && (
                        <span className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
                          <Calendar className="h-2.5 w-2.5 text-[color:var(--gh-accent)]" strokeWidth={2} />
                          {duration}
                        </span>
                      )}
                      {stayType && (
                        <span className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
                          <BedDouble className="h-2.5 w-2.5 text-[color:var(--gh-accent)]" strokeWidth={2} />
                          {stayType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Price + CTA */}
                  <div className="mt-2.5 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-[8px] font-semibold uppercase tracking-widest text-slate-400">From</p>
                      <p className="text-[15px] font-black leading-none text-[color:var(--gh-accent)]">
                        {finalPrice ? `₹ ${finalPrice}` : "TBA"}
                      </p>
                      {basePrice && finalPrice && basePrice !== finalPrice && (
                        <p className="text-[9px] font-semibold text-slate-400 line-through">
                          ₹ {basePrice}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 rounded-full bg-[linear-gradient(135deg,var(--gh-accent),var(--gh-accent-strong))] px-3.5 py-2 text-[10px] font-black text-white shadow-sm transition active:scale-95">
                      View Details →
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── Special Offer Banner ── */}
        <div className="mt-6 flex items-center gap-4 overflow-hidden rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--gh-accent-soft)]">
            <Gift className="h-6 w-6 text-[color:var(--gh-accent)]" strokeWidth={1.8} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-[color:var(--gh-accent)]">
              Special Offer
            </p>
            <p className="text-[13px] font-extrabold text-slate-900">
              Book Early &amp; Save More!
            </p>
            <p className="text-[10px] text-slate-500">
              Get up to 30% OFF on early bookings.
            </p>
          </div>
          <Link
            href="/custom-requests"
            className="shrink-0 rounded-full border border-[color:var(--gh-accent)] px-3 py-2 text-[10px] font-black text-[color:var(--gh-accent)] transition hover:bg-[color:var(--gh-accent)] hover:text-white"
          >
            Explore Offers →
          </Link>
        </div>
      </div>
    </div>
  );
}

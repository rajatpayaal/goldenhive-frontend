"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Compass,
  Loader2,
  Search,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { decodeS3Url } from "@/lib/s3url";

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 350;
const MAX_ITEMS_PER_SECTION = 6;
const RECENT_SEARCH_KEY = "gh_mobile_recent_searches";
const MAX_RECENT_SEARCHES = 8;

const TRENDING_SEARCHES = [
  "Kedarnath",
  "Char Dham",
  "Badrinath",
  "Rishikesh",
  "Auli",
  "Family tour",
];

const BROWSE_CARDS = [
  {
    label: "Sacred Circuits",
    href: "/char-dham",
    emoji: "🛕",
    gradient: "from-rose-600 via-fuchsia-600 to-violet-700",
  },
  {
    label: "All Packages",
    href: "/packages",
    emoji: "🏔️",
    gradient: "from-sky-500 via-cyan-500 to-blue-700",
  },
  {
    label: "Travel Stories",
    href: "/blogs",
    emoji: "📖",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
  },
  {
    label: "Adventure Trails",
    href: "/adventure",
    emoji: "⛺",
    gradient: "from-emerald-500 via-teal-500 to-cyan-700",
  },
];

const pageVariants = {
  initial: { y: "100%" },
  animate: { y: 0, transition: { type: "spring", stiffness: 340, damping: 34 } },
  exit: { y: "100%", transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } },
};

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const normalizeResponse = (payload) => {
  const data = payload?.data || {};
  return {
    packages: Array.isArray(data.packages) ? data.packages : [],
    blogs: Array.isArray(data.blogs) ? data.blogs : [],
    categories: Array.isArray(data.categories) ? data.categories : [],
    policies: Array.isArray(data.policies) ? data.policies : [],
  };
};

const formatPrice = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return null;
  try {
    return new Intl.NumberFormat("en-IN").format(number);
  } catch {
    return String(number);
  }
};

const readRecentSearches = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCH_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
};

const writeRecentSearches = (value) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(value));
  } catch {
    // Ignore storage failures on restrictive browsers.
  }
};

function SectionTitle({ children, action }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-[11px] font-black uppercase tracking-[0.28em] text-rose-500/70">{children}</h2>
      {action}
    </div>
  );
}

function EmptyState({ query }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center rounded-[28px] border border-rose-200 bg-white px-6 py-12 text-center shadow-[0_18px_50px_rgba(244,63,94,0.12)]"
    >
      <div className="mb-4 rounded-full border border-rose-100 bg-rose-50 p-4 text-rose-500">
        <Search className="h-6 w-6" />
      </div>
      <p className="text-lg font-black text-slate-900">No results found</p>
      <p className="mt-2 text-sm font-medium text-slate-500">
        Try different keywords for <span className="text-rose-600">{query}</span>.
      </p>
    </motion.div>
  );
}

function PackageCard({ item, onPick }) {
  const href = `/packages/${item?.basic?.slug || item?._id || ""}`;
  const name = item?.basic?.name || "Package";
  const imageUrl = item?.images?.primary?.url;
  const imageAlt = item?.images?.primary?.alt || name;
  const destination = item?.basic?.destination || "Curated spiritual getaway";
  const duration = item?.basic?.duration || item?.duration || item?.basic?.nights;
  const price = formatPrice(item?.pricing?.finalPrice);

  return (
    <motion.div variants={itemVariants}>
      <Link
        href={href}
        onClick={onPick}
        className="group block overflow-hidden rounded-[24px] border border-rose-100 bg-white shadow-[0_18px_48px_rgba(244,63,94,0.1)]"
      >
        <div className="relative h-40 overflow-hidden">
          {imageUrl ? (
            <Image
              src={decodeS3Url(imageUrl)}
              alt={imageAlt}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 320px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-950 text-4xl">
              🏔️
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-rose-950/70 via-rose-900/10 to-transparent" />
          <div className="absolute right-3 top-3 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-rose-600 backdrop-blur">
            Premium
          </div>
          {duration ? (
            <div className="absolute left-3 top-3 rounded-full border border-white/60 bg-rose-50/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-rose-700 backdrop-blur">
              {String(duration).replace(/^\s+|\s+$/g, "")}
            </div>
          ) : null}
        </div>

        <div className="relative px-4 pb-4 pt-3">
          <div className="pointer-events-none absolute -right-8 top-0 h-20 w-20 rounded-full bg-pink-300/30 blur-2xl" />
          <p className="line-clamp-2 text-base font-black text-slate-900">{name}</p>
          <p className="mt-1 text-sm font-medium text-slate-500">{destination}</p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-rose-700">
              <Compass className="h-3.5 w-3.5" />
              Handpicked
            </div>
            {price ? (
              <div className="rounded-full border border-rose-200 bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-2 text-sm font-black text-white shadow-[0_10px_30px_rgba(244,63,94,0.28)]">
                Rs {price}
              </div>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function BlogCard({ item, onPick }) {
  const href = `/blogs/${item?.slug || ""}`;
  const title = item?.title || "Blog";
  const imageUrl = item?.bannerImage?.url;
  const imageAlt = item?.bannerImage?.altText || title;

  return (
    <motion.div variants={itemVariants}>
      <Link
        href={href}
        onClick={onPick}
        className="group flex items-center gap-3 rounded-[22px] border border-rose-100 bg-white p-3 shadow-[0_14px_36px_rgba(244,63,94,0.08)]"
      >
        <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-rose-50">
          {imageUrl ? (
            <Image
              src={decodeS3Url(imageUrl)}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-2xl">📖</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-black text-slate-900">{title}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-500/70">
            {item?.category || "Travel story"}
          </p>
        </div>
        <div className="rounded-full bg-rose-50 p-2 text-rose-600">
          <BookOpen className="h-4 w-4" />
        </div>
      </Link>
    </motion.div>
  );
}

function SimpleRow({ href, title, subtitle, icon, onPick }) {
  return (
    <motion.div variants={itemVariants}>
      <Link
        href={href}
        onClick={onPick}
        className="flex items-center justify-between gap-3 rounded-[22px] border border-rose-100 bg-white px-4 py-4 shadow-[0_14px_36px_rgba(244,63,94,0.08)]"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-900">{title}</p>
          {subtitle ? <p className="mt-1 text-xs font-semibold text-slate-500">{subtitle}</p> : null}
        </div>
        <div className="rounded-full border border-rose-100 bg-rose-50 p-2 text-rose-600">{icon}</div>
      </Link>
    </motion.div>
  );
}

export function MobileSearchPage({ onClose, initialQuery = "" }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const requestIdRef = useRef(0);

  const [query, setQuery] = useState(() => initialQuery || "");
  const [status, setStatus] = useState("idle");
  const [results, setResults] = useState(() => normalizeResponse(null));
  const [recentSearches, setRecentSearches] = useState(() => readRecentSearches());

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 180);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const scrollY = window.scrollY;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = null;

    const trimmedQuery = query.trim();
    const canSearch = trimmedQuery.length >= MIN_QUERY_LENGTH;
    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    abortRef.current = controller;

    const timer = window.setTimeout(async () => {
      try {
        if (!canSearch) {
          setStatus("idle");
          setResults(normalizeResponse(null));
          return;
        }

        setStatus("loading");
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        let payload = null;
        try {
          payload = await res.json();
        } catch {
          payload = null;
        }

        if (controller.signal.aborted || requestId !== requestIdRef.current) return;

        if (!res.ok) {
          setStatus("error");
          setResults(normalizeResponse(null));
          return;
        }

        setStatus("success");
        setResults(normalizeResponse(payload));
      } catch {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return;
        setStatus("error");
        setResults(normalizeResponse(null));
      }
    }, canSearch ? DEBOUNCE_MS : 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const saveRecentSearch = (value) => {
    const trimmedValue = value.trim();
    if (trimmedValue.length < MIN_QUERY_LENGTH) return;

    setRecentSearches((current) => {
      const next = [
        trimmedValue,
        ...current.filter((item) => item.toLowerCase() !== trimmedValue.toLowerCase()),
      ].slice(0, MAX_RECENT_SEARCHES);
      writeRecentSearches(next);
      return next;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    writeRecentSearches([]);
  };

  const handlePick = () => {
    saveRecentSearch(query);
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    saveRecentSearch(query);
  };

  const handleRecentPick = (value) => {
    setQuery(value);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const hasQuery = query.trim().length >= MIN_QUERY_LENGTH;
  const hasResults =
    results.packages.length ||
    results.blogs.length ||
    results.categories.length ||
    results.policies.length;

  return (
    <motion.div
      key="mobile-search"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 z-[2147483647] flex bg-gradient-to-b from-white via-rose-50 to-pink-100 md:hidden"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-10rem] h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(244,63,94,0.2)_0%,_rgba(236,72,153,0.16)_38%,_rgba(255,255,255,0)_72%)] blur-3xl" />
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-rose-100 bg-white/95 px-4 pb-4 pt-[env(safe-area-inset-top,24px)] backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="flex items-center gap-3 pt-2">
            <motion.button
              type="button"
              onClick={onClose}
              whileTap={{ scale: 0.94 }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-rose-600"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </motion.button>

            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-rose-100 bg-white px-4 py-3 shadow-[0_14px_40px_rgba(244,63,94,0.12)]">
              <Search className="h-4 w-4 shrink-0 text-rose-500" />
              <label htmlFor={inputId} className="sr-only">
                Search
              </label>
              <input
                ref={inputRef}
                id={inputId}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Packages, destinations, blogs..."
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="w-full bg-transparent text-[15px] font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              />
              <AnimatePresence>
                {query.length > 0 ? (
                  <motion.button
                    key="clear-query"
                    type="button"
                    onClick={() => setQuery("")}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                ) : null}
              </AnimatePresence>
            </div>

            <motion.button
              type="button"
              onClick={onClose}
              whileTap={{ scale: 0.97 }}
              className="shrink-0 text-sm font-black text-rose-600"
            >
              Cancel
            </motion.button>
          </form>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(env(safe-area-inset-bottom,24px)+104px)] pt-5">
          <AnimatePresence mode="wait">
            {!hasQuery ? (
              <motion.div
                key="mobile-search-discovery"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {recentSearches.length ? (
                  <section>
                    <SectionTitle
                      action={
                        <button
                          type="button"
                          onClick={clearRecentSearches}
                          className="text-[11px] font-black uppercase tracking-[0.24em] text-rose-500/70"
                        >
                          Clear
                        </button>
                      }
                    >
                      Recent Searches
                    </SectionTitle>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((item) => (
                        <motion.button
                          key={item}
                          type="button"
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleRecentPick(item)}
                          className="rounded-full border border-rose-100 bg-white px-4 py-2 text-sm font-semibold text-rose-700 shadow-[0_10px_24px_rgba(244,63,94,0.08)]"
                        >
                          {item}
                        </motion.button>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section>
                  <SectionTitle>Browse</SectionTitle>
                  <div className="grid grid-cols-2 gap-3">
                    {BROWSE_CARDS.map((card, index) => (
                      <motion.div
                        key={card.label}
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          y: 0,
                          transition: { delay: index * 0.05, duration: 0.28 },
                        }}
                      >
                        <Link
                          href={card.href}
                          onClick={onClose}
                          className={`relative flex h-32 overflow-hidden rounded-[24px] border border-white/70 bg-gradient-to-br ${card.gradient} p-4 shadow-[0_16px_36px_rgba(244,63,94,0.14)]`}
                        >
                          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/20 blur-2xl" />
                          <div className="relative flex h-full flex-col justify-between">
                            <span className="text-3xl">{card.emoji}</span>
                            <span className="text-sm font-black uppercase tracking-[0.18em] text-white">
                              {card.label}
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </section>

                <section>
                  <SectionTitle>Trending</SectionTitle>
                  <div className="space-y-2">
                    {TRENDING_SEARCHES.map((item, index) => (
                      <motion.button
                        key={item}
                        type="button"
                        variants={itemVariants}
                        initial="hidden"
                        animate="show"
                        transition={{ delay: index * 0.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleRecentPick(item)}
                        className="flex w-full items-center gap-3 rounded-[22px] border border-rose-100 bg-white px-4 py-4 text-left shadow-[0_14px_36px_rgba(244,63,94,0.08)]"
                      >
                        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-2.5 text-rose-600">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-black text-slate-900">{item}</span>
                      </motion.button>
                    ))}
                  </div>
                </section>
              </motion.div>
            ) : (
              <motion.div
                key="mobile-search-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {status === "loading" ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
                    <Loader2 className="h-7 w-7 animate-spin text-rose-500" />
                    <p className="text-sm font-semibold">Searching...</p>
                  </div>
                ) : null}

                {status === "error" ? (
                  <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-6 text-center">
                    <p className="text-sm font-black text-rose-700">Search failed. Please try again.</p>
                  </div>
                ) : null}

                {status === "success" && !hasResults ? <EmptyState query={query.trim()} /> : null}

                {status === "success" && hasResults ? (
                  <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-7">
                    {results.packages.length ? (
                      <section className="space-y-3">
                        <SectionTitle>Packages</SectionTitle>
                        <div className="space-y-3">
                          {results.packages
                            .slice(0, MAX_ITEMS_PER_SECTION)
                            .map((item) => (
                              <PackageCard key={item?._id || item?.basic?.slug} item={item} onPick={handlePick} />
                            ))}
                        </div>
                      </section>
                    ) : null}

                    {results.blogs.length ? (
                      <section className="space-y-3">
                        <SectionTitle>Blogs</SectionTitle>
                        <div className="space-y-3">
                          {results.blogs
                            .slice(0, MAX_ITEMS_PER_SECTION)
                            .map((item) => (
                              <BlogCard key={item?._id || item?.slug} item={item} onPick={handlePick} />
                            ))}
                        </div>
                      </section>
                    ) : null}

                    {results.categories.length ? (
                      <section className="space-y-3">
                        <SectionTitle>Categories</SectionTitle>
                        <div className="space-y-3">
                          {results.categories
                            .slice(0, MAX_ITEMS_PER_SECTION)
                            .map((item) => (
                              <SimpleRow
                                key={item?._id || item?.slug}
                                href={`/${String(item?.slug || "").toLowerCase()}`}
                                title={item?.name || "Category"}
                                subtitle="Explore curated journeys"
                                icon={<Sparkles className="h-4 w-4" />}
                                onPick={handlePick}
                              />
                            ))}
                        </div>
                      </section>
                    ) : null}

                    {results.policies.length ? (
                      <section className="space-y-3">
                        <SectionTitle>Policies</SectionTitle>
                        <div className="space-y-3">
                          {results.policies
                            .slice(0, MAX_ITEMS_PER_SECTION)
                            .map((item) => (
                              <SimpleRow
                                key={item?._id || item?.slug}
                                href={`/policies/${item?.slug || ""}`}
                                title={item?.title || item?.name || "Policy"}
                                subtitle="Support and booking information"
                                icon={<BookOpen className="h-4 w-4" />}
                                onPick={handlePick}
                              />
                            ))}
                        </div>
                      </section>
                    ) : null}
                  </motion.div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
}

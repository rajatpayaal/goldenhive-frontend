"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 350;
const MAX_ITEMS_PER_SECTION = 6;

const normalizeResponse = (payload) => {
  const data = payload?.data || {};
  return {
    packages: Array.isArray(data.packages) ? data.packages : [],
    blogs: Array.isArray(data.blogs) ? data.blogs : [],
    categories: Array.isArray(data.categories) ? data.categories : [],
    policies: Array.isArray(data.policies) ? data.policies : [],
    count: typeof data.count === "number" ? data.count : null,
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

function SearchResults({ query, status, results, onPick }) {
  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length >= MIN_QUERY_LENGTH;
  const packages = results?.packages || [];
  const blogs = results?.blogs || [];
  const categories = results?.categories || [];
  const policies = results?.policies || [];

  if (!hasQuery) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-4 text-sm font-semibold text-slate-600 shadow-[0_18px_45px_rgba(2,6,23,0.08)]">
        Type at least {MIN_QUERY_LENGTH} letters to search.
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-4 text-sm font-semibold text-slate-600 shadow-[0_18px_45px_rgba(2,6,23,0.08)]">
        Searching...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 shadow-[0_18px_45px_rgba(2,6,23,0.08)]">
        Search failed. Please try again.
      </div>
    );
  }

  const section = (label, items, renderItem) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="py-2">
        <div className="px-3 pb-2 pt-3 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
          {label}
        </div>
        <div className="grid gap-1 px-2 pb-2">
          {items.slice(0, MAX_ITEMS_PER_SECTION).map(renderItem)}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-full rounded-2xl border border-black/5 bg-white shadow-[0_18px_45px_rgba(2,6,23,0.08)]">
      {section("Packages", packages, (pkg) => {
        const href = `/packages/${pkg?.basic?.slug || pkg?._id || ""}`;
        const name = pkg?.basic?.name || "Package";
        const destination = pkg?.basic?.destination;
        const tagline = pkg?.basic?.tagline;
        const price = formatPrice(pkg?.pricing?.finalPrice);
        const imageUrl = pkg?.images?.primary?.url;
        const imageAlt = pkg?.images?.primary?.alt || name;

        return (
          <Link
            key={pkg?._id || href}
            href={href}
            onClick={onPick}
            className="group flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-3 py-2 hover:bg-emerald-50"
          >
            <div className="h-11 w-11 overflow-hidden rounded-xl border border-black/5 bg-slate-50">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-black text-slate-400">
                  GH
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-black text-slate-900 group-hover:text-emerald-800">
                {name}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-600">
                {destination && <span className="truncate">{destination}</span>}
                {tagline && <span className="truncate text-slate-500">{tagline}</span>}
              </div>
            </div>
            {price && <div className="text-sm font-black text-slate-900">Rs {price}</div>}
          </Link>
        );
      })}

      {section("Blogs", blogs, (blog) => {
        const href = `/blogs/${blog?.slug || ""}`;
        const title = blog?.title || "Blog";
        const imageUrl = blog?.bannerImage?.url;
        const imageAlt = blog?.bannerImage?.altText || title;

        return (
          <Link
            key={blog?._id || href}
            href={href}
            onClick={onPick}
            className="group flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-3 py-2 hover:bg-emerald-50"
          >
            <div className="h-11 w-11 overflow-hidden rounded-xl border border-black/5 bg-slate-50">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-black text-slate-400">
                  Blog
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-black text-slate-900 group-hover:text-emerald-800">
                {title}
              </div>
              {blog?.category && (
                <div className="mt-0.5 truncate text-xs font-semibold text-slate-600">
                  {blog.category}
                </div>
              )}
            </div>
          </Link>
        );
      })}

      {section("Categories", categories, (category) => {
        const slug = category?.slug || "";
        const href = `/${String(slug).toLowerCase()}`;
        const name = category?.name || "Category";
        return (
          <Link
            key={category?._id || href}
            href={href}
            onClick={onPick}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white px-3 py-2 hover:bg-emerald-50"
          >
            <span className="truncate text-sm font-black text-slate-900 group-hover:text-emerald-800">
              {name}
            </span>
            <span className="text-slate-400" aria-hidden="true">
              &gt;
            </span>
          </Link>
        );
      })}

      {section("Policies", policies, (policy) => {
        const href = `/policies/${policy?.slug || ""}`;
        const title = policy?.title || policy?.name || "Policy";
        return (
          <Link
            key={policy?._id || href}
            href={href}
            onClick={onPick}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white px-3 py-2 hover:bg-emerald-50"
          >
            <span className="truncate text-sm font-black text-slate-900 group-hover:text-emerald-800">
              {title}
            </span>
            <span className="text-slate-400" aria-hidden="true">
              &gt;
            </span>
          </Link>
        );
      })}

      {packages.length === 0 &&
        blogs.length === 0 &&
        categories.length === 0 &&
        policies.length === 0 && (
          <div className="p-4 text-sm font-semibold text-slate-600">
            No results found for <span className="font-black text-slate-900">{trimmedQuery}</span>.
          </div>
        )}
    </div>
  );
}

export function GlobalSearch({ variant = "inline", tone = "header-light" }) {
  const inputId = useId();
  const pathname = usePathname();
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const requestIdRef = useRef(0);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("idle");
  const [results, setResults] = useState(() => normalizeResponse(null));
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isIconVariant = variant === "icon";
  const isHeroVariant = variant === "hero";
  const activeOpen = isIconVariant ? isDialogOpen : isPanelOpen;
  const isDark = tone === "header-dark";

  const trimmedQuery = query.trim();
  const canSearch = trimmedQuery.length >= MIN_QUERY_LENGTH;

  const closeAll = useCallback(() => {
    setIsPanelOpen(false);
    setIsDialogOpen(false);
  }, []);

  useEffect(() => {
    const handler = (event) => {
      const detail = event?.detail || {};
      const nextQuery = typeof detail.query === "string" ? detail.query : "";

      setQuery(nextQuery);
      if (isIconVariant) {
        setIsDialogOpen(true);
      } else {
        setIsPanelOpen(true);
      }

      setTimeout(() => inputRef.current?.focus(), 0);
    };

    window.addEventListener("gh_open_search", handler);
    return () => window.removeEventListener("gh_open_search", handler);
  }, [isIconVariant]);

  useEffect(() => {
    const timer = window.setTimeout(() => closeAll(), 0);
    return () => window.clearTimeout(timer);
  }, [closeAll, pathname]);

  useEffect(() => {
    if (!activeOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeAll();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeOpen, closeAll]);

  useEffect(() => {
    if (isIconVariant || !isPanelOpen) return;

    const onPointerDown = (event) => {
      const target = event.target;
      if (!containerRef.current) return;
      if (target instanceof Node && containerRef.current.contains(target)) return;
      setIsPanelOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () => document.removeEventListener("pointerdown", onPointerDown, { capture: true });
  }, [isIconVariant, isPanelOpen]);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = null;

    const currentRequestId = ++requestIdRef.current;
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

        if (controller.signal.aborted || currentRequestId !== requestIdRef.current) return;

        if (!res.ok) {
          setStatus("error");
          setResults(normalizeResponse(null));
          return;
        }

        setStatus("success");
        setResults(normalizeResponse(payload));
      } catch {
        if (controller.signal.aborted || currentRequestId !== requestIdRef.current) return;
        setStatus("error");
        setResults(normalizeResponse(null));
      }
    }, canSearch ? DEBOUNCE_MS : 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [canSearch, trimmedQuery]);

  const onPick = useCallback(() => {
    closeAll();
    setQuery("");
  }, [closeAll]);

  const resultPanel = useMemo(() => {
    if (!activeOpen) return null;
    return <SearchResults query={query} status={status} results={results} onPick={onPick} />;
  }, [activeOpen, onPick, query, results, status]);

  if (isIconVariant) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setIsDialogOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className={[
            "inline-flex h-10 items-center justify-center rounded-2xl border px-3 text-sm font-black transition",
            isDark
              ? "border-white/15 bg-white/10 text-white hover:bg-white/15"
              : "border-black/10 bg-white text-slate-900 hover:bg-slate-50",
          ].join(" ")}
          aria-label="Search"
          aria-haspopup="dialog"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
        </button>

        {isDialogOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Search">
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
              onClick={closeAll}
              aria-label="Close search"
            />

            <div className="absolute left-1/2 top-4 w-[22rem] max-w-[92vw] -translate-x-1/2 overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_18px_45px_rgba(2,6,23,0.18)]">
              <div className="flex items-center gap-2 border-b border-black/5 px-4 py-3">
                <label htmlFor={inputId} className="sr-only">
                  Search
                </label>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-lg">
                  <Search className="h-5 w-5 text-slate-700" aria-hidden="true" />
                </div>
                <input
                  ref={inputRef}
                  id={inputId}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search packages, blogs, categories..."
                  autoComplete="off"
                  className="h-10 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={closeAll}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-white text-xl font-black text-slate-900 hover:bg-slate-50"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="max-h-[26rem] overflow-y-auto p-3">{resultPanel}</div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div
      ref={containerRef}
      className={[
        "relative z-50 w-full",
        isHeroVariant ? "max-w-none" : "max-w-[24rem] lg:max-w-[22rem]",
      ].join(" ")}
    >
      <label htmlFor={inputId} className="sr-only">
        Search
      </label>
      <div
        className={[
          "flex items-center gap-2 rounded-2xl px-3 py-2 transition",
          isHeroVariant
            ? "border border-gh-gold/20 bg-white text-slate-900 shadow-sm focus-within:border-gh-gold/60 focus-within:ring-2 focus-within:ring-gh-gold/20"
            : "border border-black/10 bg-white shadow-sm focus-within:border-gh-gold/60 focus-within:ring-2 focus-within:ring-gh-gold/25",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          id={inputId}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsPanelOpen(true)}
          placeholder="Search packages, blogs, categories..."
          autoComplete="off"
          className={[
            "w-full bg-transparent text-sm font-semibold outline-none",
            isHeroVariant
              ? "text-slate-900 placeholder:text-slate-400"
              : "text-slate-900 placeholder:text-slate-400",
          ].join(" ")}
          role="combobox"
          aria-expanded={isPanelOpen}
          aria-controls={`${inputId}-panel`}
        />
        <Search
          className={[
            "h-5 w-5 shrink-0",
            isHeroVariant ? "text-gh-gold" : "text-slate-600",
          ].join(" ")}
          aria-hidden="true"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatus("idle");
              setResults(normalizeResponse(null));
              inputRef.current?.focus();
            }}
            className={[
              "inline-flex h-8 w-8 items-center justify-center rounded-xl text-base font-black",
              isHeroVariant
                ? "border border-gh-gold/20 bg-white text-slate-700 hover:bg-slate-50"
                : "border border-black/10 bg-white text-slate-700 hover:bg-slate-50",
            ].join(" ")}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {isPanelOpen && (
        <div
          id={`${inputId}-panel`}
          className={[
            "absolute left-0 right-0 top-full z-[70] mt-2 overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_18px_45px_rgba(2,6,23,0.18)]",
            isHeroVariant ? "w-full max-w-full" : "w-[22rem] max-w-[92vw]",
          ].join(" ")}
        >
          <div className="max-h-[26rem] overflow-y-auto">{resultPanel}</div>
        </div>
      )}
    </div>
  );
}

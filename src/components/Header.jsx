"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { LoginModal } from './LoginModal';

const resolveAnchorId = (slug) => {
  if (!slug) return "packages";
  const normalized = slug.toLowerCase();
  // Keep backwards-compat with the commonly-used #packages anchor.
  if (normalized === "tour-packages") return "packages";
  return normalized;
};

export function Header({ categories = [] }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const categoryLinks = categories.filter(
    (category) => category?.isActive !== false && category?.name && category?.slug
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-black tracking-tight text-slate-900">
              GoldenHive
            </Link>
            <span className="hidden rounded-full border border-black/5 bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-600 sm:inline-flex">
              Premium Travel
            </span>
          </div>

          <nav className="flex flex-1 flex-wrap items-center justify-center gap-2" aria-label="Tour categories">
            {categoryLinks.length > 0 ? (
              categoryLinks.map((category) => (
                <Link
                  key={category._id}
                  className="inline-flex items-center justify-center rounded-full border border-black/5 bg-slate-50 px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-emerald-50 hover:text-emerald-700"
                  href={`#${resolveAnchorId(category.slug)}`}
                >
                  {category.name}
                </Link>
              ))
            ) : (
              <span className="text-sm font-semibold text-slate-500">Loading…</span>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-black text-slate-900 hover:bg-slate-50"
            >
              Log In / Sign Up
            </button>
            <a
              href="https://wa.me/919999999999"
              aria-label="WhatsApp"
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-emerald-600"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}

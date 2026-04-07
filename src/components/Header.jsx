"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { LoginModal } from './LoginModal';
import { UserMenu } from './UserMenu';
import { useAuth } from '../hooks/useAuth';
import { useDispatch, useSelector } from "react-redux";
import { cartActions, refreshCartCount } from "@/store";
import { GlobalSearch } from "./GlobalSearch";

const resolveAnchorId = (slug) => {
  if (!slug) return "";
  return slug.toLowerCase();
};

export function Header({ categories = [] }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(() => ({ open: false, path: null }));
  const { user, isLoading } = useAuth();
  const dispatch = useDispatch();
  const cartCount = useSelector((state) => state.cart.count);
  const pathname = usePathname();
  const isMobileMenuOpen = mobileMenu.open && mobileMenu.path === pathname;
  const categoryLinks = categories.filter(
    (category) => category?.isActive !== false && category?.name && category?.slug
  );

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      dispatch(cartActions.clearCart());
      return;
    }
    dispatch(refreshCartCount());
  }, [dispatch, isLoading, user]);

  useEffect(() => {
    const handler = () => dispatch(refreshCartCount());
    window.addEventListener("gh_cart_updated", handler);
    return () => window.removeEventListener("gh_cart_updated", handler);
  }, [dispatch]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMobileMenu((prev) => ({ ...prev, open: false }));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900 hover:text-emerald-700">
            <span>GoldenHive</span>
            <span className="hidden rounded-full border border-black/5 bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-600 md:inline-flex">
              Premium Travel
            </span>
          </Link>

          <nav
            className="hidden min-w-0 flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap px-1 no-scrollbar lg:flex lg:flex-nowrap"
            aria-label="Tour categories"
          >
            {categoryLinks.length > 0 ? (
              <>
                {categoryLinks.map((category) => (
                  <Link
                    key={category._id}
                    className="inline-flex whitespace-nowrap items-center justify-center rounded-full border border-black/5 bg-slate-50 px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-emerald-50 hover:text-emerald-700"
                    href={`/${resolveAnchorId(category.slug)}`}
                  >
                    {category.name}
                  </Link>
                ))}
              </>
            ) : (
              <span className="text-sm font-semibold text-slate-500">Loading…</span>
            )}
          </nav>

          <div className="hidden items-center gap-2 lg:flex xl:gap-3">
            <GlobalSearch variant="inline" />
            <Link
              href="/custom-requests"
              className="hidden items-center justify-center rounded-2xl border border-emerald-500 bg-emerald-500/10 px-4 py-2 text-sm font-black text-emerald-700 hover:bg-emerald-500/20 md:inline-flex"
            >
              Custom Request
            </Link>
            <Link 
              href="/cart"
              className="relative inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-black text-slate-900 hover:bg-slate-50"
              aria-label="Shopping Cart"
            >
              <span className="text-lg mr-2">🛒</span>
              Cart
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-black text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {!isLoading && !user && (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-black text-slate-900 hover:bg-slate-50"
              >
                Log In / Sign Up
              </button>
            )}

            {!isLoading && user && (
              <UserMenu />
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <GlobalSearch variant="icon" />
            <Link
              href="/cart"
              className="relative inline-flex h-10 items-center justify-center rounded-2xl border border-black/10 bg-white px-3 text-sm font-black text-slate-900 hover:bg-slate-50"
              aria-label="Shopping Cart"
            >
              <span className="text-lg">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-black text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {!isLoading && user && <UserMenu />}

            {!isLoading && !user && (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="inline-flex h-10 items-center justify-center rounded-2xl border border-black/10 bg-white px-3 text-sm font-black text-slate-900 hover:bg-slate-50"
              >
                Log In
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenu({ open: true, path: pathname })}
              className="inline-flex h-10 items-center justify-center rounded-2xl border border-black/10 bg-white px-3 text-sm font-black text-slate-900 hover:bg-slate-50"
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={isMobileMenuOpen}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setMobileMenu((prev) => ({ ...prev, open: false }))}
            aria-label="Close menu"
          />

          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] border-l border-black/5 bg-white shadow-[0_18px_45px_rgba(2,6,23,0.18)]">
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
              <div className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Menu</div>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-xl font-black text-slate-900 hover:bg-slate-50"
                onClick={() => setMobileMenu((prev) => ({ ...prev, open: false }))}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="no-scrollbar h-full overflow-y-auto px-5 pb-7 pt-5">
              <div className="grid gap-2">
                <Link
                  href="/custom-requests"
                  onClick={() => setMobileMenu((prev) => ({ ...prev, open: false }))}
                  className="inline-flex items-center justify-center rounded-2xl border border-emerald-500 bg-emerald-500/10 px-4 py-3 text-sm font-black text-emerald-700 hover:bg-emerald-500/20"
                >
                  Custom Request
                </Link>
                <Link
                  href="/blogs"
                  onClick={() => setMobileMenu((prev) => ({ ...prev, open: false }))}
                  className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-black text-slate-900 hover:bg-slate-50"
                >
                  Blogs
                </Link>
                <Link
                  href="/policies"
                  onClick={() => setMobileMenu((prev) => ({ ...prev, open: false }))}
                  className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-black text-slate-900 hover:bg-slate-50"
                >
                  Policies
                </Link>
                <Link
                  href="/about-us"
                  onClick={() => setMobileMenu((prev) => ({ ...prev, open: false }))}
                  className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-black text-slate-900 hover:bg-slate-50"
                >
                  About Us
                </Link>
              </div>

              <div className="mt-6 border-t border-black/5 pt-5">
                <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
                  Categories
                </div>
                <div className="mt-3 grid gap-2">
                  {categoryLinks.length > 0 ? (
                    categoryLinks.map((category) => (
                      <Link
                        key={category._id}
                        href={`/${resolveAnchorId(category.slug)}`}
                        onClick={() => setMobileMenu((prev) => ({ ...prev, open: false }))}
                        className="inline-flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-black text-slate-900 hover:bg-slate-50"
                      >
                        <span>{category.name}</span>
                        <span className="text-slate-400" aria-hidden="true">›</span>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                      Loading…
                    </div>
                  )}
                </div>
              </div>

              {!isLoading && !user && (
                <div className="mt-6 border-t border-black/5 pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenu((prev) => ({ ...prev, open: false }));
                      setIsLoginOpen(true);
                    }}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-emerald-600"
                  >
                    Log In / Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}

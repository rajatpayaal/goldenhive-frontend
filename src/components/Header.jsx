"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LoginModal } from './LoginModal';
import { UserMenu } from './UserMenu';
import { useAuth } from '../hooks/useAuth';
import { useDispatch, useSelector } from "react-redux";
import { cartActions, refreshCartCount } from "@/store";

const resolveAnchorId = (slug) => {
  if (!slug) return "";
  return slug.toLowerCase();
};

export function Header({ categories = [] }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const dispatch = useDispatch();
  const cartCount = useSelector((state) => state.cart.count);
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

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900 hover:text-emerald-700">
            <span>GoldenHive</span>
            <span className="hidden rounded-full border border-black/5 bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-600 sm:inline-flex">
              Premium Travel
            </span>
          </Link>

          <nav className="flex flex-1 flex-wrap items-center justify-center gap-2" aria-label="Tour categories">
            {categoryLinks.length > 0 ? (
              <>
                {categoryLinks.map((category) => (
                  <Link
                    key={category._id}
                    className="inline-flex items-center justify-center rounded-full border border-black/5 bg-slate-50 px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-emerald-50 hover:text-emerald-700"
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

          <div className="flex items-center gap-3">
            <Link
              href="/custom-requests"
              className="inline-flex items-center justify-center rounded-2xl border border-emerald-500 bg-emerald-500/10 px-4 py-2 text-sm font-black text-emerald-700 hover:bg-emerald-500/20"
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
        </div>
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}

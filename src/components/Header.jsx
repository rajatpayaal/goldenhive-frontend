"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Menu, User } from "lucide-react";

import { LoginModal } from "./LoginModal";
import { UserMenu } from "./UserMenu";
import { useAuth } from "../hooks/useAuth";
import { useDispatch, useSelector } from "react-redux";
import { cartActions, refreshCartCount } from "@/store";
import { checkAuthTokenAction } from "@/actions/auth.check";
import { getUnreadNotificationsCountAction } from "@/actions/notifications.actions";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { CartDropdown } from "./CartDropdown";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const resolveAnchorId = (slug) => {
  if (!slug) return "";
  return slug.toLowerCase();
};

export function Header({ categories = [], initialUnreadCount = 0 }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(() => ({ open: false, path: null }));
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const { user, isLoading } = useAuth();
  const dispatch = useDispatch();
  const cartCount = useSelector((state) => state.cart.count);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isMobileMenuOpen = mobileMenu.open && mobileMenu.path === pathname;
  const categoryLinks = categories.filter(
    (category) => category?.isActive !== false && category?.name && category?.slug
  );
  const visibleCategoryCount = 6;
  const visibleCategories = categoryLinks.slice(0, visibleCategoryCount);
  const overflowCategories = categoryLinks.slice(visibleCategoryCount);
  const headerTone = "header-light";

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      dispatch(cartActions.clearCart());
      return;
    }
    dispatch(refreshCartCount());
  }, [dispatch, isLoading, user]);

  useEffect(() => {
    if (isLoading) return;

    const loadUnreadCount = async () => {
      try {
        const auth = await checkAuthTokenAction();
        if (!auth?.hasToken) {
          setUnreadCount(0);
          return;
        }

        const response = await getUnreadNotificationsCountAction();
        if (!response?.ok) {
          setUnreadCount(0);
          return;
        }

        setUnreadCount(response?.data?.data?.total ?? 0);
      } catch {
        setUnreadCount(0);
      }
    };

    loadUnreadCount();
  }, [isLoading, user]);

  useEffect(() => {
    const handler = () => dispatch(refreshCartCount());
    window.addEventListener("gh_cart_updated", handler);
    return () => window.removeEventListener("gh_cart_updated", handler);
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreOpen(false);
      }
    };

    if (moreOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    }

    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [moreOpen]);

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b border-black/5 bg-white/80 text-slate-900 backdrop-blur"
      >
        <div className="mx-auto flex w-full items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <Sheet
              open={isMobileMenuOpen}
              onOpenChange={(open) => {
                setMobileMenu(open ? { open: true, path: pathname } : { open: false, path: null });
              }}
            >
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg lg:hidden"
                  aria-label="Open menu"
                  aria-haspopup="dialog"
                  aria-expanded={isMobileMenuOpen}
                >
                  <Menu className="h-6 w-6 text-slate-800" strokeWidth={1.5} aria-hidden="true" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="border-r border-black/5">
                <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
                  <div className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Menu</div>
                  <SheetClose asChild>
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-slate-900 hover:bg-slate-50"
                      aria-label="Close"
                    >
                      <ChevronRight className="h-5 w-5 rotate-180" aria-hidden="true" />
                    </button>
                  </SheetClose>
                </div>

                <div className="no-scrollbar h-full overflow-y-auto px-5 pb-7 pt-5">
                  <div className="grid gap-2">
                    <SheetClose asChild>
                      <Link
                        href="/blogs"
                        className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-black text-slate-900 hover:bg-slate-50"
                      >
                        Blogs
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/policies"
                        className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-black text-slate-900 hover:bg-slate-50"
                      >
                        Policies
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/about-us"
                        className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-black text-slate-900 hover:bg-slate-50"
                      >
                        About Us
                      </Link>
                    </SheetClose>
                  </div>

                  <div className="mt-6 border-t border-black/5 pt-5">
                    <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
                      Categories
                    </div>
                    <div className="mt-3 grid gap-2">
                      {categoryLinks.length > 0 ? (
                        categoryLinks.map((category) => (
                          <SheetClose key={category._id} asChild>
                            <Link
                              href={`/${resolveAnchorId(category.slug)}`}
                              className="inline-flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-black text-slate-900 hover:bg-slate-50"
                            >
                              <span>{category.name}</span>
                              <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
                            </Link>
                          </SheetClose>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                          Loading...
                        </div>
                      )}
                    </div>
                  </div>

                  {!isLoading && !user && (
                    <div className="mt-6 border-t border-black/5 pt-5">
                      <Button
                        type="button"
                        onClick={() => {
                          setMobileMenu({ open: false, path: null });
                          setIsLoginOpen(true);
                        }}
                        variant="brand"
                        className="w-full rounded-2xl py-3 text-sm font-black"
                      >
                        Log In / Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/logo-full.svg"
                alt="GoldenHive Holidays"
                width={300}
                height={80}
                priority
                className="h-8 w-auto sm:h-11"
              />
            </Link>
          </div>

          <nav
            className="hidden min-w-0 flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap px-1 no-scrollbar lg:flex lg:flex-nowrap"
            aria-label="Tour categories"
          >
            {categoryLinks.length > 0 ? (
              <>
                {visibleCategories.map((category) => (
                  <Link
                    key={category._id}
                    className="inline-flex whitespace-nowrap items-center justify-center rounded-xl px-3 py-2 text-sm font-bold transition text-slate-700 hover:text-gh-primary"
                    href={`/${resolveAnchorId(category.slug)}`}
                  >
                    {category.name}
                  </Link>
                ))}

                {overflowCategories.length > 0 && (
                  <div ref={moreRef} className="relative inline-block">
                    <button
                      type="button"
                      onClick={() => setMoreOpen((prev) => !prev)}
                      className="inline-flex whitespace-nowrap items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition text-slate-700 hover:text-gh-primary"
                      aria-expanded={moreOpen}
                      aria-haspopup="menu"
                    >
                      More
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    </button>
                    {moreOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-3xl border border-black/10 bg-white p-2 shadow-gh-soft">
                        {overflowCategories.map((category) => (
                          <Link
                            key={category._id}
                            href={`/${resolveAnchorId(category.slug)}`}
                            className="block rounded-2xl px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                            onClick={() => setMoreOpen(false)}
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <span className="text-sm font-semibold text-slate-500">
                Loading...
              </span>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <NotificationsDropdown
              initialUnreadCount={unreadCount}
              onUnreadCountChange={setUnreadCount}
              variant={headerTone}
            />

            <CartDropdown cartCount={cartCount} variant={headerTone} />

            {!isLoading && !user && (
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="hidden items-center gap-2 rounded-full bg-gh-primary px-6 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-yellow-500 lg:inline-flex"
              >
                <User className="h-4 w-4" />
                Log In
              </button>
            )}

            {!isLoading && !user && (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gh-primary text-slate-900 lg:hidden"
                aria-label="Log In"
              >
                <div className="h-4 w-4 rounded-full border-2 border-slate-900" />
              </button>
            )}

            {!isLoading && user && <UserMenu />}
          </div>
        </div>
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}

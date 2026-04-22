"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Menu } from "lucide-react";

import { LoginModal } from "./LoginModal";
import { UserMenu } from "./UserMenu";
import { useAuth } from "../hooks/useAuth";
import { useDispatch, useSelector } from "react-redux";
import { cartActions, refreshCartCount } from "@/store";
import { GlobalSearch } from "./GlobalSearch";
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
  const headerTone = useMemo(() => (isHome ? "header-dark" : "header-light"), [isHome]);

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

  // Route changes close the mobile menu automatically because `isMobileMenuOpen`
  // is derived from the pathname.

  return (
    <>
      <header
        className={[
          "sticky top-0 z-40 border-b backdrop-blur",
          isHome
            ? "border-white/10 bg-gradient-to-b from-gh-plum/80 via-gh-plum/55 to-gh-plum/15 text-white"
            : "border-black/5 bg-white/80 text-slate-900",
        ].join(" ")}
      >
        <div className="mx-auto flex w-full items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="leading-none">
              <div
                className={[
                  "text-xl font-black tracking-tight",
                  isHome ? "text-gh-gold" : "text-gh-plum",
                ].join(" ")}
              >
                GoldenHive
              </div>
              <div
                className={[
                  "mt-1 text-[10px] font-extrabold tracking-[0.45em]",
                  isHome ? "text-white/70" : "text-slate-500",
                ].join(" ")}
              >
                HOLIDAYS
              </div>
            </div>
          </Link>

          <nav
            className="hidden min-w-0 flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap px-1 no-scrollbar lg:flex lg:flex-nowrap"
            aria-label="Tour categories"
          >
            {categoryLinks.length > 0 ? (
              <>
                {visibleCategories.map((category) => (
                  <Link
                    key={category._id}
                    className={[
                      "inline-flex whitespace-nowrap items-center justify-center rounded-xl px-3 py-2 text-sm font-extrabold transition",
                      isHome
                        ? "text-white/85 hover:text-gh-gold"
                        : "text-slate-700 hover:text-gh-plum",
                    ].join(" ")}
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
                      className={[
                        "inline-flex whitespace-nowrap items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold transition",
                        isHome
                          ? "text-white/85 hover:text-gh-gold"
                          : "text-slate-700 hover:text-gh-plum",
                      ].join(" ")}
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
              <span
                className={
                  isHome ? "text-sm font-semibold text-white/70" : "text-sm font-semibold text-slate-500"
                }
              >
                Loading...
              </span>
            )}
          </nav>

          <div className="hidden flex-shrink-0 items-center gap-2 lg:flex xl:gap-3">
            <GlobalSearch variant={isHome ? "icon" : "inline"} tone={headerTone} />
            {/* <Link
              href="/custom-requests"
              className="hidden items-center justify-center rounded-2xl border border-emerald-500 bg-emerald-500/10 px-4 py-2 text-sm font-black text-emerald-700 hover:bg-emerald-500/20 md:inline-flex"
            >
              Custom Request
            </Link> */}

            <NotificationsDropdown
              initialUnreadCount={unreadCount}
              onUnreadCountChange={setUnreadCount}
              variant={headerTone}
            />

            <CartDropdown cartCount={cartCount} variant={headerTone} />

            {!isLoading && !user && (
              <Button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                variant={isHome ? "brand" : "outline"}
                className="rounded-2xl px-4 py-2 text-sm font-black"
              >
                Log In
              </Button>
            )}

            {!isLoading && user && (
              <UserMenu />
            )}
          </div>

          <Sheet
            open={isMobileMenuOpen}
            onOpenChange={(open) => {
              setMobileMenu(open ? { open: true, path: pathname } : { open: false, path: null });
            }}
          >
            <div className="flex items-center gap-2 lg:hidden">
              <GlobalSearch variant="icon" tone={headerTone} />
              <CartDropdown cartCount={cartCount} variant={headerTone} />

              {!isLoading && user && <UserMenu />}

              {!isLoading && !user && (
                <Button
                  type="button"
                  onClick={() => setIsLoginOpen(true)}
                  variant={isHome ? "brand" : "outline"}
                  className="h-10 rounded-2xl px-3 text-sm font-black"
                >
                  Log In
                </Button>
              )}

              <SheetTrigger asChild>
                <button
                  type="button"
                  className={[
                    "inline-flex h-10 items-center justify-center rounded-2xl border px-3 text-sm font-black transition",
                    isHome
                      ? "border-white/15 bg-white/10 text-white hover:bg-white/15"
                      : "border-black/10 bg-white text-slate-900 hover:bg-slate-50",
                  ].join(" ")}
                  aria-label="Open menu"
                  aria-haspopup="dialog"
                  aria-expanded={isMobileMenuOpen}
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </button>
              </SheetTrigger>
            </div>

            <SheetContent className="border-l border-black/5">
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
        </div>
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}

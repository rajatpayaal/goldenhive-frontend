"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Bell,
  BookOpenText,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  Crown,
  FileText,
  Heart,
  Home,
  LayoutGrid,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Newspaper,
  Phone,
  Shield,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from "lucide-react";

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
import { logoutAction } from "@/actions/auth.actions";

const resolveAnchorId = (slug) => {
  if (!slug) return "";
  return slug.toLowerCase();
};

function MobileMenuItem({ icon: Icon, label, badge, accent = false }) {
  return (
    <div
      className={[
        "flex items-center justify-between rounded-[1.35rem] border px-4 py-3 transition",
        accent
          ? "border-rose-100 bg-gradient-to-r from-rose-50 via-pink-50 to-white text-rose-600 shadow-[0_10px_24px_rgba(255,79,138,0.1)]"
          : "border-rose-100/80 bg-white/90 text-slate-900 shadow-[0_8px_20px_rgba(148,163,184,0.08)] hover:bg-rose-50/70",
      ].join(" ")}
    >
      <span className="flex items-center gap-3">
        <span
          className={[
            "inline-flex h-10 w-10 items-center justify-center rounded-2xl",
            accent ? "bg-rose-500 text-white" : "bg-rose-50 text-rose-500",
          ].join(" ")}
        >
          <Icon className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        <span className="text-sm font-black">{label}</span>
      </span>
      <span className="flex items-center gap-2">
        {typeof badge === "number" && badge > 0 ? (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[color:var(--gh-accent)] px-1.5 py-0.5 text-[10px] font-black text-white">
            {badge > 9 ? "9+" : badge}
          </span>
        ) : null}
        <ChevronRight className="h-4 w-4 text-rose-300" />
      </span>
    </div>
  );
}

function MobileMenuSection({ title, children }) {
  return (
    <section className="mt-6">
      <div className="mb-3 px-1 text-[11px] font-black uppercase tracking-[0.24em] text-rose-500">
        {title}
      </div>
      <div className="grid gap-2.5">{children}</div>
    </section>
  );
}

export function Header({ categories = [], initialUnreadCount = 0 }) {
  const router = useRouter();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(() => ({ open: false, path: null }));
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const { user, isLoading, clearUser } = useAuth();
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
  const mobileCategoryLinks = categoryLinks.slice(0, 6);
  const headerTone = "header-light";
  const avatarUrl = user?.profilePicture || user?.avatar;
  const userDisplayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || user?.userName || "GoldenHive User";
  const userInitials = userDisplayName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await logoutAction();
    clearUser?.();
    setMobileMenu({ open: false, path: null });
    router.push("/");
  };

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
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 shadow-sm lg:hidden after:absolute after:-inset-1"
                  aria-label="Open menu"
                  aria-haspopup="dialog"
                  aria-expanded={isMobileMenuOpen}
                >
                  <Menu className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[92vw] max-w-[24rem] border-r-0 bg-[linear-gradient(180deg,#fffdfd_0%,#fff7fa_52%,#fffefe_100%)] p-0 shadow-[0_18px_50px_rgba(255,79,138,0.16)]">
                <div className="no-scrollbar h-full overflow-y-auto px-5 pb-8 pt-5">
                  <div className="flex items-center justify-between">
                    <Image
                      src="/desktoplogo.svg"
                      alt="GoldenHive Holidays"
                      width={180}
                      height={52}
                      className="h-10 w-auto"
                    />
                    <SheetClose asChild>
                      <button
                        type="button"
                        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-100 bg-white text-slate-700 shadow-sm hover:bg-rose-50 after:absolute after:-inset-0.5"
                        aria-label="Close"
                      >
                        <X className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </SheetClose>
                  </div>

                  {!isLoading && !user ? (
                    <>
                      <div className="relative mt-5 overflow-hidden rounded-[2rem] border border-rose-100 bg-white px-5 pb-5 pt-4 shadow-[0_18px_40px_rgba(255,79,138,0.1)]">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,_rgba(255,79,138,0.18),_rgba(255,255,255,0)_72%)]" />
                        <div className="relative">
                          <div className="rounded-[1.7rem] bg-[linear-gradient(180deg,rgba(255,247,250,0.92),rgba(255,255,255,0.9))] px-4 py-5">
                            <div className="h-28 rounded-[1.5rem] bg-[radial-gradient(circle_at_50%_8%,rgba(255,79,138,0.22),rgba(255,255,255,0)_60%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,244,248,0.95))]">
                              <div className="flex h-full items-end justify-center pb-3">
                                <div className="h-14 w-28 rounded-[999px_999px_0_0] bg-gradient-to-t from-rose-200 via-pink-100 to-transparent blur-sm" />
                              </div>
                            </div>
                            <h2 className="mt-4 text-[1.9rem] font-black leading-none text-slate-900">
                              Explore the world
                            </h2>
                            <p className="mt-2 max-w-[15rem] text-sm font-semibold leading-6 text-slate-500">
                              Find your perfect travel experience with us.
                            </p>
                          </div>

                          <div className="mt-4 grid gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setMobileMenu({ open: false, path: null });
                                setIsLoginOpen(true);
                              }}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,var(--gh-accent),var(--gh-accent-strong))] px-5 py-3.5 text-sm font-black text-white shadow-[0_14px_30px_rgba(255,79,138,0.22)]"
                            >
                              <User className="h-4 w-4" />
                              Login / Sign Up
                            </button>
                            <SheetClose asChild>
                              <Link
                                href="/packages"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-5 py-3.5 text-sm font-black text-rose-600"
                              >
                                Book Now
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </SheetClose>
                          </div>
                        </div>
                      </div>

                      <MobileMenuSection title="Main Menu">
                        <SheetClose asChild>
                          <Link href="/">
                            <MobileMenuItem icon={Home} label="Home" accent={pathname === "/"} />
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/packages">
                            <MobileMenuItem icon={ShoppingBag} label="Packages" accent={pathname === "/packages"} />
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/tour-packages">
                            <MobileMenuItem icon={LayoutGrid} label="Categories" />
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/custom-requests">
                            <MobileMenuItem icon={Sparkles} label="Custom Trip" />
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/blogs">
                            <MobileMenuItem icon={BookOpenText} label="Blogs / Travel Guide" />
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/about-us">
                            <MobileMenuItem icon={User} label="About Us" />
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/support/general">
                            <MobileMenuItem icon={MessageCircle} label="Support / Contact" />
                          </Link>
                        </SheetClose>
                      </MobileMenuSection>

                      <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-rose-100 bg-[linear-gradient(135deg,#fff5f8,#ffffff)] p-4 shadow-[0_16px_34px_rgba(255,79,138,0.08)]">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
                          Mega Offer
                        </div>
                        <div className="mt-2 text-2xl font-black leading-tight text-slate-900">
                          Char Dham Yatra 2026
                        </div>
                        <div className="mt-1 text-xs font-semibold text-slate-500">
                          Limited period spiritual journey discount
                        </div>
                        <div className="mt-4 flex items-end justify-between gap-3">
                          <div className="rounded-2xl border border-rose-100 bg-white px-3 py-2">
                            <div className="text-2xl font-black text-rose-500">15% OFF</div>
                            <div className="text-[10px] font-bold text-slate-500">Use Code: CHARDHAM26</div>
                          </div>
                          <div className="h-20 w-16 rounded-t-[2rem] bg-gradient-to-t from-rose-300 via-pink-200 to-transparent opacity-80" />
                        </div>
                        <SheetClose asChild>
                          <Link
                            href="/packages"
                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,var(--gh-accent),var(--gh-accent-strong))] px-4 py-3 text-sm font-black text-white"
                          >
                            Explore Offer
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </SheetClose>
                      </div>

                      <MobileMenuSection title="Categories">
                        {mobileCategoryLinks.length > 0 ? (
                          mobileCategoryLinks.map((category) => (
                            <SheetClose key={category._id} asChild>
                              <Link href={`/${resolveAnchorId(category.slug)}`}>
                                <MobileMenuItem icon={Heart} label={category.name} />
                              </Link>
                            </SheetClose>
                          ))
                        ) : (
                          <div className="rounded-[1.35rem] border border-rose-100 bg-white px-4 py-3 text-sm font-semibold text-slate-500">
                            Loading categories...
                          </div>
                        )}
                      </MobileMenuSection>

                      <MobileMenuSection title="Stay Connected">
                        <a href="tel:+917505917525">
                          <MobileMenuItem icon={Phone} label="Call Us" />
                        </a>
                        <a href="https://wa.me/917505917525" target="_blank" rel="noopener noreferrer">
                          <MobileMenuItem icon={MessageCircle} label="WhatsApp Us" />
                        </a>
                        <a href="mailto:support@goldenhiveholidays.com">
                          <MobileMenuItem icon={Mail} label="Email Us" />
                        </a>
                      </MobileMenuSection>
                    </>
                  ) : (
                    <>
                      <div className="mt-5 rounded-[2rem] border border-rose-100 bg-white p-4 shadow-[0_18px_40px_rgba(255,79,138,0.1)]">
                        <div className="flex items-center gap-3">
                          <div className="relative h-16 w-16 overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-rose-100 to-pink-100">
                            {avatarUrl ? (
                              <Image src={avatarUrl} alt={userDisplayName} fill className="object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-lg font-black text-rose-600">
                                {userInitials || "GH"}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-lg font-black text-slate-900">
                              Hi, {userDisplayName}
                            </div>
                            <div className="truncate text-sm font-semibold text-slate-500">{user?.email || "Welcome back"}</div>
                            <div className="truncate text-sm font-semibold text-slate-500">{user?.mobile || "+91 Travel with us"}</div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-rose-300" />
                        </div>

                        <div className="mt-4 flex items-center justify-between rounded-[1.4rem] border border-amber-100 bg-gradient-to-r from-amber-50 via-white to-rose-50 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                              <Crown className="h-4.5 w-4.5" />
                            </span>
                            <div>
                              <div className="text-sm font-black text-amber-700">Gold Member</div>
                              <div className="text-xs font-semibold text-slate-500">Your premium journeys in one place</div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-amber-300" />
                        </div>
                      </div>

                      <MobileMenuSection title="Main Menu">
                        <SheetClose asChild>
                          <Link href="/">
                            <MobileMenuItem icon={Home} label="Home" accent={pathname === "/"} />
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/packages">
                            <MobileMenuItem icon={Sparkles} label="Explore Trips" />
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/bookings">
                            <MobileMenuItem icon={BriefcaseBusiness} label="My Bookings" accent={pathname === "/bookings"} />
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/cart">
                            <MobileMenuItem icon={Heart} label="Saved / Cart" badge={cartCount} />
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/custom-requests">
                            <MobileMenuItem icon={Sparkles} label="Custom Trip" />
                          </Link>
                        </SheetClose>
                        <button type="button" className="text-left">
                          <MobileMenuItem icon={Bell} label="Notifications" badge={unreadCount} />
                        </button>
                        <SheetClose asChild>
                          <Link href="/about-us">
                            <MobileMenuItem icon={ChevronDown} label="More" />
                          </Link>
                        </SheetClose>
                      </MobileMenuSection>

                      <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-rose-100 bg-[linear-gradient(135deg,#fff5f8,#ffffff)] p-4 shadow-[0_16px_34px_rgba(255,79,138,0.08)]">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
                          Mega Offer
                        </div>
                        <div className="mt-2 text-2xl font-black leading-tight text-slate-900">
                          Char Dham Yatra 2026
                        </div>
                        <div className="mt-1 text-xs font-semibold text-slate-500">
                          Limited period spiritual journey discount
                        </div>
                        <div className="mt-4 flex items-end justify-between gap-3">
                          <div className="rounded-2xl border border-rose-100 bg-white px-3 py-2">
                            <div className="text-2xl font-black text-rose-500">15% OFF</div>
                            <div className="text-[10px] font-bold text-slate-500">Use Code: CHARDHAM26</div>
                          </div>
                          <div className="h-20 w-16 rounded-t-[2rem] bg-gradient-to-t from-rose-300 via-pink-200 to-transparent opacity-80" />
                        </div>
                        <SheetClose asChild>
                          <Link
                            href="/packages"
                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,var(--gh-accent),var(--gh-accent-strong))] px-4 py-3 text-sm font-black text-white"
                          >
                            Explore Offer
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </SheetClose>
                      </div>

                      <MobileMenuSection title="Account">
                        <SheetClose asChild>
                          <Link href="/profile">
                            <MobileMenuItem icon={User} label="My Profile" />
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/bookings">
                            <MobileMenuItem icon={BriefcaseBusiness} label="Travellers" />
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/cart">
                            <MobileMenuItem icon={Heart} label="Saved Trips / Wishlist" badge={cartCount} />
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/custom-requests">
                            <MobileMenuItem icon={Sparkles} label="Custom Requests" />
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/profile/blogs">
                            <MobileMenuItem icon={Newspaper} label="Reviews" />
                          </Link>
                        </SheetClose>
                      </MobileMenuSection>

                      <MobileMenuSection title="Support">
                        <SheetClose asChild>
                          <Link href="/support/general">
                            <MobileMenuItem icon={MessageCircle} label="Support Tickets" />
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/policies">
                            <MobileMenuItem icon={FileText} label="FAQs" />
                          </Link>
                        </SheetClose>
                        <a href="tel:+917505917525">
                          <MobileMenuItem icon={Phone} label="Call Support" />
                        </a>
                        <a href="https://wa.me/917505917525" target="_blank" rel="noopener noreferrer">
                          <MobileMenuItem icon={MessageCircle} label="WhatsApp Support" />
                        </a>
                      </MobileMenuSection>

                      <MobileMenuSection title="Security">
                        <SheetClose asChild>
                          <Link href="/policies">
                            <MobileMenuItem icon={Shield} label="Security Settings" />
                          </Link>
                        </SheetClose>
                      </MobileMenuSection>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-5 py-3.5 text-sm font-black text-rose-600 shadow-[0_10px_24px_rgba(255,79,138,0.08)]"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </>
                  )}

                  <div className="mt-8 border-t border-rose-100 pt-5">
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-black text-slate-500">
                      <SheetClose asChild>
                        <Link href="/policies" className="rounded-2xl border border-rose-100 bg-white px-2 py-3">
                          FAQs
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/policies" className="rounded-2xl border border-rose-100 bg-white px-2 py-3">
                          Privacy Policy
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/policies" className="rounded-2xl border border-rose-100 bg-white px-2 py-3">
                          Terms & Conditions
                        </Link>
                      </SheetClose>
                    </div>
                    <div className="mt-4 text-center text-xs font-semibold text-slate-400">v 1.0.0</div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/desktoplogo.svg"
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

          <div className="flex items-center gap-2 sm:gap-3">
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
                className="hidden items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--gh-accent),var(--gh-accent-strong))] px-6 py-2.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(255,79,138,0.24)] transition hover:opacity-90 lg:inline-flex"
              >
                <User className="h-4 w-4" />
                Log In
              </button>
            )}

            {!isLoading && !user && (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--gh-accent),var(--gh-accent-strong))] text-white shadow-md transition hover:opacity-90 lg:hidden after:absolute after:-inset-1"
                aria-label="Log In"
              >
                <User className="h-4 w-4" />
              </button>
            )}

            {!isLoading && user && <div className="hidden lg:block"><UserMenu /></div>}
          </div>
        </div>
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}

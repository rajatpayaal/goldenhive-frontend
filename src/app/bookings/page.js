"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
  CalendarDays,
  MapPin,
  Users,
  Package,
  MessageCircle,
  ChevronRight,
  Download,
  CalendarClock,
  UserPlus,
  XCircle,
  Gift,
  HeadphonesIcon,
  ArrowRight,
  Briefcase,
  Wallet,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { getMyBookingsAction } from "@/actions/booking.actions";
import { checkAuthTokenAction } from "@/actions/auth.check";
import { LoginModal } from "@/components/LoginModal";
import Link from "next/link";
import Loader from "@/components/Loader";
import { decodeS3Url } from "@/lib/s3url";

/* ─── helpers ─────────────────────────────────────────────────── */
const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "-";
  }
};

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "TBA";
  try {
    return `₹ ${new Intl.NumberFormat("en-IN").format(amount)}`;
  } catch {
    return `₹ ${amount}`;
  }
};

const getBookingStatus = (booking) => {
  const s = booking.status?.toUpperCase();
  if (s === "CONFIRMED") return "CONFIRMED";
  if (s === "CANCELLED") return "CANCELLED";
  if (s === "COMPLETED") return "COMPLETED";
  return "UPCOMING";
};

const STATUS_CONFIG = {
  UPCOMING:  { label: "UPCOMING",  bg: "bg-[color:var(--gh-accent)]", text: "text-white" },
  CONFIRMED: { label: "CONFIRMED", bg: "bg-emerald-500",               text: "text-white" },
  COMPLETED: { label: "COMPLETED", bg: "bg-slate-500",                 text: "text-white" },
  CANCELLED: { label: "CANCELLED", bg: "bg-rose-500",                  text: "text-white" },
};

const PAYMENT_CONFIG = {
  PAID:   { label: "PAID",   bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  UNPAID: { label: "UNPAID", bg: "bg-orange-100",  text: "text-orange-700",  border: "border-orange-200" },
};

const getPrimaryPackage = (booking) => {
  if (Array.isArray(booking.packageId) && booking.packageId.length > 0) {
    const item = booking.packageId[0];
    return typeof item === "string" ? null : item;
  }

  if (booking.packageId && typeof booking.packageId === "object" && !Array.isArray(booking.packageId)) {
    return booking.packageId;
  }

  if (Array.isArray(booking.packageItems) && booking.packageItems.length > 0) {
    const item = booking.packageItems[0]?.packageId;
    return item && typeof item === "object" ? item : null;
  }

  return null;
};

const getPackageName = (booking) => {
  const pkg = getPrimaryPackage(booking);
  return pkg?.basic?.name || null;
};

const getPackageImage = (booking) => {
  const pkg = getPrimaryPackage(booking);
  const imageUrl = pkg?.images?.primary?.url || pkg?.images?.gallery?.[0]?.url || null;
  return decodeS3Url(imageUrl);
};

const getPackageDestination = (booking) => {
  const pkg = getPrimaryPackage(booking);
  return pkg?.basic?.destination || null;
};

const TABS = ["All", "Upcoming", "Confirmed", "Completed", "Cancelled"];

/* ─── Booking Card ────────────────────────────────────────────── */
function BookingCard({ booking }) {
  const status = getBookingStatus(booking);
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.UPCOMING;
  const paymentKey = booking.paymentStatus?.toUpperCase() === "PAID" ? "PAID" : "UNPAID";
  const isPaid = paymentKey === "PAID";
  const pkgName = getPackageName(booking) || booking.bookingNo || `Booking #${booking._id?.slice(-6).toUpperCase()}`;
  const pkgImage = getPackageImage(booking);
  const destination = getPackageDestination(booking);
  const bookingNo = booking.bookingNo || booking._id?.slice(-10).toUpperCase();
  const packageCount = Array.isArray(booking.packageId) ? booking.packageId.length : 1;
  const waLink = `https://wa.me/7505917525?text=I%20need%20help%20with%20booking%20${encodeURIComponent(bookingNo)}`;

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_4px_20px_rgba(17,24,39,0.05)]">
      <div className="flex gap-4 p-3 pb-4">
        {/* Left Image */}
        <div className="relative w-[140px] shrink-0 overflow-hidden rounded-2xl">
          {pkgImage ? (
            <Image
              src={pkgImage}
              alt={pkgName}
              fill
              className="object-cover"
              sizes="140px"
            />
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "linear-gradient(135deg,#1e3a5f,#2d6a9f)" }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/20" />
          
          <div className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[8px] font-black tracking-wider ${statusCfg.bg} ${statusCfg.text}`}>
            {statusCfg.label}
          </div>

          <div className="absolute bottom-2 left-2 right-2 rounded-xl bg-black/60 p-2 backdrop-blur-md">
            <p className="text-[7px] font-bold text-white/70">Booking ID</p>
            <p className="truncate text-[9px] font-black text-white">{bookingNo}</p>
          </div>
          {/* Force aspect ratio */}
          <div className="h-[180px]" />
        </div>

        {/* Right Content */}
        <div className="flex flex-1 flex-col justify-between py-1 pr-1">
          <div>
            <h2 className="line-clamp-2 text-[14px] font-black leading-tight text-slate-900">{pkgName}</h2>
            {destination && (
              <div className="mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0 text-rose-500" strokeWidth={2.5} />
                <span className="truncate text-[10px] font-bold text-slate-500">{destination}</span>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-y-3 gap-x-2">
              <div className="flex items-start gap-1.5">
                <CalendarDays className="mt-0.5 h-3.5 w-3.5 text-rose-500" strokeWidth={2} />
                <div>
                  <p className="text-[10px] font-black text-slate-900">{formatDate(booking.startDate)}</p>
                  <p className="text-[9px] font-semibold text-slate-400">Check-in</p>
                </div>
              </div>
              <div className="flex items-start gap-1.5">
                <CalendarClock className="mt-0.5 h-3.5 w-3.5 text-rose-500" strokeWidth={2} />
                <div>
                  <p className="text-[10px] font-black text-slate-900">{formatDate(booking.endDate)}</p>
                  <p className="text-[9px] font-semibold text-slate-400">Check-out</p>
                </div>
              </div>
              <div className="col-span-2 flex items-start gap-1.5 pt-1">
                <Users className="mt-0.5 h-3.5 w-3.5 text-rose-500" strokeWidth={2} />
                <div>
                  <p className="text-[10px] font-black text-slate-900">{booking.travellers || 1} Traveller</p>
                  <p className="text-[9px] font-semibold text-slate-400">{packageCount} Package</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between border-t border-slate-100 pt-3">
            <div>
              <p className="text-[9px] font-semibold text-slate-400">Payment Status</p>
              <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-black uppercase ${
                isPaid ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-orange-200 bg-orange-50 text-orange-500"
              }`}>
                {paymentKey}
              </span>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-semibold text-slate-400">Total Amount</p>
              <p className="text-[16px] font-black leading-none text-rose-500">{formatCurrency(booking.totalAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      {/* Footer Actions */}
      <div className="flex border-t border-slate-100 bg-rose-50/30">
        <Link
          href={`/bookings/${booking._id}`}
          className="flex flex-1 items-center justify-center gap-1.5 py-3.5 text-[11px] font-black text-rose-500 transition hover:bg-rose-50/50"
        >
          View Details
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </Link>
        <div className="w-px bg-slate-100" />
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 py-3.5 text-[11px] font-black text-slate-700 transition hover:bg-slate-50"
        >
          <MessageCircle className="h-3.5 w-3.5 text-rose-500" strokeWidth={2} />
          Contact Support
        </a>
      </div>
    </article>
  );
}

/* ─── Quick Actions ───────────────────────────────────────────── */
function QuickActions() {
  const actions = [
    { icon: Download,     label: "Download Invoice" },
    { icon: CalendarClock, label: "Change Dates" },
    { icon: UserPlus,     label: "Add Travellers" },
    { icon: XCircle,      label: "Cancel Booking" },
  ];
  return (
    <div className="flex rounded-3xl border border-rose-100 bg-rose-50/30 p-2 shadow-sm">
      {actions.map(({ icon: Icon, label }, idx) => (
        <button
          key={label}
          type="button"
          className={`flex flex-1 flex-col items-center justify-center gap-2 p-2 transition hover:bg-white/50 active:scale-95 ${idx !== actions.length - 1 ? 'border-r border-rose-100/50' : ''}`}
        >
          <Icon className="h-5 w-5 text-rose-500" strokeWidth={1.5} />
          <span className="text-center text-[8px] font-bold leading-tight text-slate-700">{label}</span>
        </button>
      ))}
    </div>
  );
}

/* ─── Refer Banner ─────────────────────────────────────── */
function ReferBanner() {
  const [shareState, setShareState] = useState("Share Link");

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/` : "/";

    try {
      if (navigator.share) {
        await navigator.share({
          title: "GoldenHive Holidays",
          text: "Check out GoldenHive Holidays.",
          url,
        });
        setShareState("Shared");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareState("Link Copied");
      } else {
        setShareState("Share Link");
        return;
      }

      window.setTimeout(() => setShareState("Share Link"), 2200);
    } catch {
      setShareState("Share Link");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-6 shadow-md mt-2">
      <div className="absolute -left-4 -top-4 h-16 w-16 text-rose-300 opacity-50">
        <Gift className="h-full w-full" />
      </div>
      <div className="absolute -bottom-4 -right-2 h-20 w-20 text-rose-300 opacity-50">
        <Gift className="h-full w-full" />
      </div>
      
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="pl-6">
          <p className="text-[16px] font-black text-white">Refer</p>
          <p className="mt-1 text-[10px] font-semibold text-white/90">Share GoldenHive with your friends.</p>
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-[11px] font-black text-rose-500 shadow-sm transition active:scale-95"
        >
          {shareState}
          <Share2 className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */
export default function BookingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [hasToken, setHasToken] = useState(null);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    let active = true;
    const checkToken = async () => {
      try {
        const auth = await checkAuthTokenAction();
        if (active) setHasToken(auth.hasToken);
      } catch {
        if (active) setHasToken(false);
      }
    };
    checkToken();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user && hasToken === null) return;
    if (!user && hasToken === false) return;

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await getMyBookingsAction();
        if (response.ok) {
          setBookings(response.data?.data || []);
          setError("");
        } else {
          setError(response.data?.message || response.data?.error || "Failed to load bookings.");
          setBookings([]);
        }
      } catch {
        setError("Failed to load bookings. Please try again.");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [authLoading, user, hasToken]);

  /* Stats */
  const totalSpent = bookings.reduce((s, b) => s + (Number(b.totalAmount) || 0), 0);
  const upcoming = bookings.filter((b) => {
    const s = b.status?.toUpperCase();
    return s !== "CANCELLED" && s !== "COMPLETED";
  }).length;

  /* Filtered bookings */
  const filtered = useMemo(() => {
    if (activeTab === "All") return bookings;
    if (activeTab === "Upcoming") return bookings.filter((b) => {
      const s = b.status?.toUpperCase();
      return s !== "CANCELLED" && s !== "COMPLETED" && s !== "CONFIRMED";
    });
    if (activeTab === "Confirmed") return bookings.filter((b) => b.status?.toUpperCase() === "CONFIRMED");
    if (activeTab === "Completed") return bookings.filter((b) => b.status?.toUpperCase() === "COMPLETED");
    if (activeTab === "Cancelled") return bookings.filter((b) => b.status?.toUpperCase() === "CANCELLED");
    return bookings;
  }, [bookings, activeTab]);

  if (authLoading || hasToken === null || (loading && (user || hasToken))) {
    return <Loader message="Loading your trips..." />;
  }

  /* ── Not logged in ── */
  if (!user && hasToken === false) {
    return (
      <>
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#4a0d22] via-[#5c1331] to-[#2b0814] px-5 pb-8 pt-12 text-white md:hidden">
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{ backgroundImage: "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80)" }}
          />
          <div className="relative">
            <p className="text-[13px] font-semibold text-white/70">Welcome 👋</p>
            <h1 className="mt-1 text-[28px] font-black leading-tight">My Trips</h1>
            <p className="mt-1.5 text-[12px] font-semibold text-white/70">Track your bookings, manage travellers and view payment status.</p>
          </div>
        </div>

        <div className="px-4 py-8 md:hidden">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-[0_2px_16px_rgba(17,24,39,0.08)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[color:var(--gh-accent-soft)]">
              <Briefcase className="h-7 w-7 text-[color:var(--gh-accent)]" strokeWidth={1.8} />
            </div>
            <h2 className="mt-4 text-[17px] font-extrabold text-slate-900">Log in to see your journeys</h2>
            <p className="mx-auto mt-2 max-w-xs text-[12px] font-semibold text-slate-500">
              Your confirmed tours, pending requests, and payment updates will appear here once you sign in.
            </p>
            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              className="mt-6 w-full rounded-full bg-[linear-gradient(135deg,var(--gh-accent),var(--gh-accent-strong))] py-3 text-[13px] font-black text-white shadow-sm transition active:scale-95"
            >
              Log In / Sign Up
            </button>
            <Link href="/" className="mt-3 block text-[12px] font-semibold text-slate-500 underline">Go Home</Link>
          </div>
        </div>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

        {/* Desktop fallback */}
        <div className="hidden md:block mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="text-3xl font-black text-slate-900">My Trips</h1>
          <p className="mt-3 text-slate-500">Please log in to view your bookings.</p>
          <button type="button" onClick={() => setIsLoginOpen(true)} className="mt-6 rounded-2xl bg-[color:var(--gh-accent)] px-8 py-3 font-black text-white">
            Log In
          </button>
          <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </div>
      </>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <>
      {/* ══ MOBILE LAYOUT ══════════════════════════════════════ */}
      <div className="flex min-h-screen flex-col bg-[#fff5f7] pb-32 md:hidden">

        {/* ── Hero Banner ── */}
        <div className="relative mx-4 mt-4 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#3b0b1c] via-[#4d0f25] to-[#240611] px-5 pb-6 pt-6 text-white shadow-xl">
          {/* Mountain bg */}
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{ backgroundImage: "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80)" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#3b0b1c]/30 to-[#240611]/95" />

          <div className="relative">
            <p className="text-[13px] font-semibold text-white/90">Hello, {firstName} 👋</p>
            <h1 className="mt-0.5 text-[32px] font-black leading-tight">My Trips</h1>
            <p className="mt-1 text-[11px] font-semibold text-white/80">
              Track your bookings, manage travellers and view payment status.
            </p>

            {/* Stats row */}
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
              {[
                { icon: Briefcase, label: "Total Bookings", value: bookings.length },
                { icon: CalendarDays, label: "Upcoming Trip", value: upcoming },
                { icon: Wallet, label: "Total Spent", value: totalSpent > 0 ? `₹ ${new Intl.NumberFormat("en-IN").format(totalSpent)}` : "—" },
              ].map(({ icon: Icon, label, value }, idx) => (
                <div key={label} className={`flex flex-1 items-center gap-2 ${idx !== 2 ? 'border-r border-white/10' : ''} px-2`}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Icon className="h-4 w-4 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[13px] font-black leading-none text-white">{value}</p>
                    <p className="mt-0.5 text-[8px] font-semibold text-white/70">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://wa.me/7505917525"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-full bg-rose-500 px-4 py-2.5 text-[11px] font-black text-white shadow-sm transition active:scale-95"
              >
                <HeadphonesIcon className="h-3.5 w-3.5" strokeWidth={2} />
                Need Help?
              </a>
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-[11px] font-black text-slate-900 shadow-sm transition active:scale-95"
              >
                Track All Bookings
                <ArrowRight className="h-3.5 w-3.5 text-slate-500" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 py-4">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-[11px] font-bold transition ${
                  isActive
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : "bg-white text-slate-700 border border-slate-100"
                }`}
              >
                {tab === "All" && <Package className="h-3.5 w-3.5" strokeWidth={2.5} />}
                {tab === "Upcoming" && <CalendarDays className="h-3.5 w-3.5" strokeWidth={2.5} />}
                {tab === "Confirmed" && <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />}
                {tab === "Completed" && <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />}
                {tab === "Cancelled" && <XCircle className="h-3.5 w-3.5" strokeWidth={2.5} />}
                {tab === "All" ? "All Bookings" : tab}
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 space-y-4 px-4 pt-4">

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* Empty */}
          {!error && filtered.length === 0 && (
            <div className="flex flex-col items-center rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-[0_2px_12px_rgba(17,24,39,0.06)]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[color:var(--gh-accent-soft)]">
                <Package className="h-7 w-7 text-[color:var(--gh-accent)]" strokeWidth={1.8} />
              </div>
              <p className="mt-4 text-[15px] font-extrabold text-slate-900">
                {activeTab === "All" ? "No trips yet" : `No ${activeTab} trips`}
              </p>
              <p className="mt-2 text-[12px] font-semibold text-slate-500">
                {activeTab === "All"
                  ? "Book a package to start your journey!"
                  : `You have no ${activeTab.toLowerCase()} bookings.`}
              </p>
              {activeTab === "All" && (
                <Link
                  href="/"
                  className="mt-5 rounded-full bg-[linear-gradient(135deg,var(--gh-accent),var(--gh-accent-strong))] px-6 py-3 text-[12px] font-black text-white shadow-sm transition active:scale-95"
                >
                  Browse Packages
                </Link>
              )}
            </div>
          )}

          {/* Booking cards */}
          {!error && filtered.map((booking) => (
            <BookingCard key={booking._id} booking={booking} />
          ))}

          {/* Quick Actions */}
          {!error && filtered.length > 0 && <QuickActions />}

          {/* Refer */}
          <ReferBanner />
        </div>
      </div>

      {/* ══ DESKTOP LAYOUT ══════════════════════════════════════ */}
      <div className="hidden min-h-screen flex-col bg-[#F8F9FB] md:flex">

        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#3b0b1c] via-[#4d0f25] to-[#240611] px-8 pb-8 pt-12 text-white lg:px-12">
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{ backgroundImage: "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80)" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#240611]/80" />

          <div className="relative w-full">
            <p className="text-[15px] font-semibold text-white/75">Hello, {firstName} 👋</p>
            <h1 className="mt-1 text-[38px] font-black leading-tight">My Trips</h1>
            <p className="mt-2 text-[13px] font-semibold text-white/70">
              Track your bookings, manage travellers and view payment status.
            </p>

            {/* Stats row */}
            <div className="mt-6 flex gap-4">
              {[
                { icon: Briefcase,    label: "Total Bookings", value: bookings.length },
                { icon: CalendarDays, label: "Upcoming Trip",  value: upcoming },
                { icon: Wallet,       label: "Total Spent",    value: totalSpent > 0 ? `₹ ${new Intl.NumberFormat("en-IN").format(totalSpent)}` : "—" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                    <Icon className="h-5 w-5 text-white" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[20px] font-black leading-none text-white">{value}</p>
                    <p className="mt-1 text-[11px] font-semibold text-white/65">{label}</p>
                  </div>
                </div>
              ))}

              {/* CTA buttons */}
              <div className="ml-auto flex items-center gap-3 self-center">
                <a
                  href="https://wa.me/7505917525"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-[12px] font-black text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
                >
                  <HeadphonesIcon className="h-4 w-4" strokeWidth={2} />
                  Need Help?
                </a>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[12px] font-black text-[color:var(--gh-accent)] shadow-sm transition hover:shadow-md active:scale-95"
                >
                  Track All Bookings
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="border-b border-slate-200 bg-white px-8 py-3 shadow-[0_1px_4px_rgba(17,24,39,0.05)] lg:px-12">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2 text-[12px] font-bold transition ${
                    activeTab === tab
                      ? "bg-[color:var(--gh-accent)] text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {tab === "All" && "⊞ "}
                  {tab === "Upcoming" && "🗓 "}
                  {tab === "Confirmed" && "✅ "}
                  {tab === "Completed" && "🏆 "}
                  {tab === "Cancelled" && "✕ "}
                  {tab === "All" ? "All Bookings" : tab}
                </button>
              ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="w-full flex-1 space-y-4 px-8 py-6 lg:px-12">

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>
          )}

          {/* Empty */}
          {!error && filtered.length === 0 && (
            <div className="flex flex-col items-center rounded-3xl border border-slate-100 bg-white p-16 text-center shadow-[0_2px_12px_rgba(17,24,39,0.06)]">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[color:var(--gh-accent-soft)]">
                <Package className="h-9 w-9 text-[color:var(--gh-accent)]" strokeWidth={1.8} />
              </div>
              <p className="mt-5 text-[18px] font-extrabold text-slate-900">
                {activeTab === "All" ? "No trips yet" : `No ${activeTab} trips`}
              </p>
              <p className="mt-2 text-[13px] font-semibold text-slate-500">
                {activeTab === "All" ? "Book a package to start your journey!" : `You have no ${activeTab.toLowerCase()} bookings.`}
              </p>
              {activeTab === "All" && (
                <Link href="/" className="mt-6 rounded-full bg-[linear-gradient(135deg,var(--gh-accent),var(--gh-accent-strong))] px-8 py-3 text-[13px] font-black text-white shadow-sm transition hover:shadow-md active:scale-95">
                  Browse Packages
                </Link>
              )}
            </div>
          )}

          {/* Booking cards */}
          {!error && filtered.map((booking) => (
            <BookingCard key={booking._id} booking={booking} />
          ))}

          {/* Quick Actions */}
          {!error && filtered.length > 0 && <QuickActions />}

          {/* Refer */}
          <ReferBanner />
        </div>
      </div>
    </>
  );
}

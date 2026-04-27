"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { BriefcaseBusiness, CalendarDays, CircleHelp, CreditCard, MapPinned, MessageCircle, Package, Sparkles, UserRound } from "lucide-react";
import { getMyBookingsAction } from "@/actions/booking.actions";
import { checkAuthTokenAction } from "@/actions/auth.check";
import { LoginModal } from "@/components/LoginModal";
import Link from "next/link";
import Loader from "@/components/Loader";

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
    return `Rs. ${new Intl.NumberFormat("en-IN").format(amount)}`;
  } catch {
    return `Rs. ${amount}`;
  }
};

const statusTone = (value) => {
  if (value === "CONFIRMED") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (value === "REQUESTED") return "border-amber-200 bg-amber-50 text-amber-700";
  if (value === "CANCELLED") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-[color:var(--gh-border)] bg-white text-[color:var(--gh-text-soft)]";
};

const paymentTone = (value) => {
  if (value === "PAID") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (value === "UNPAID") return "border-orange-200 bg-orange-50 text-orange-700";
  return "border-[color:var(--gh-border)] bg-white text-[color:var(--gh-text-soft)]";
};

const shellClass =
  "rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.98)] shadow-[0_18px_45px_rgba(121,68,44,0.12)]";

function PageIntro() {
  return (
    <section className="relative overflow-hidden rounded-[36px] border border-[color:var(--gh-border)] bg-[linear-gradient(135deg,rgba(31,41,64,0.96),rgba(72,45,104,0.94)_52%,rgba(255,79,138,0.9))] px-7 py-8 text-white shadow-[0_26px_80px_rgba(74,39,80,0.28)] sm:px-10 sm:py-10">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-64 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
      <div className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.28em] text-white/80">
            <Sparkles className="h-3.5 w-3.5" />
            Booking Dashboard
          </div>
          <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-5xl">
            My Bookings
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-white/80 sm:text-base">
            Track your upcoming journeys, booking status, support requests, and payment progress from one clean place.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[26rem] lg:max-w-[28rem] lg:flex-1">
          <div className="rounded-3xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/65">Stay Updated</div>
            <div className="mt-2 text-sm font-semibold text-white">Every booking timeline stays visible here.</div>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/65">Need Support</div>
            <div className="mt-2 text-sm font-semibold text-white">Reach us on WhatsApp whenever plans change.</div>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/65">Secure Records</div>
            <div className="mt-2 text-sm font-semibold text-white">Booking details and payments remain organized.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyStateCard({ title, description, primaryHref, primaryLabel, onPrimaryClick, secondaryHref, secondaryLabel }) {
  return (
    <div className={`${shellClass} p-8 text-center sm:p-10`}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,rgba(255,79,138,0.12),rgba(255,185,94,0.22))] text-[color:var(--gh-accent)] shadow-[0_18px_35px_rgba(255,79,138,0.14)]">
        <BriefcaseBusiness className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-2xl font-black text-[color:var(--gh-heading)]">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-7 text-[color:var(--gh-text-soft)] sm:text-base">
        {description}
      </p>
      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {onPrimaryClick ? (
          <button
            type="button"
            onClick={onPrimaryClick}
            className="gh-primary-btn inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-black"
          >
            {primaryLabel}
          </button>
        ) : (
          <Link
            href={primaryHref}
            className="gh-primary-btn inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-black"
          >
            {primaryLabel}
          </Link>
        )}
        <Link
          href={secondaryHref}
          className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--gh-border)] bg-white px-6 py-3 text-sm font-black text-[color:var(--gh-heading)] hover:bg-[color:var(--gh-bg-soft)]"
        >
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.98)] px-4 py-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--gh-text-soft)]">
        <Icon className="h-4 w-4 text-[color:var(--gh-accent)]" />
        {label}
      </div>
      <div className="mt-2 text-sm font-black text-[color:var(--gh-heading)] sm:text-base">{value}</div>
    </div>
  );
}

export default function BookingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [hasToken, setHasToken] = useState(null);

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
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user && hasToken === null) return;

    if (!user && hasToken === false) {
      // User not logged in and no token - don't load bookings
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await getMyBookingsAction();
        if (response.ok) {
          setBookings(response.data?.data || []);
          setError("");
        } else {
          if (response.status === 401) {
            setError("Session expired. Please log in again.");
          } else {
            setError(response.data?.message || response.data?.error || "Failed to load bookings.");
          }
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

  if (authLoading || hasToken === null || (loading && (user || hasToken))) {
    return <Loader message="Loading your bookings..." />;
  }

  if (!user && hasToken === false) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        <PageIntro />
        <div className="mt-6">
          <EmptyStateCard
            title="Log in to see your journeys"
            description="Your confirmed tours, pending requests, and payment updates will appear here once you sign in to your GoldenHive account."
            primaryLabel="Log In / Sign Up"
            onPrimaryClick={() => setIsLoginOpen(true)}
            secondaryHref="/"
            secondaryLabel="Go Home"
          />
        </div>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        <PageIntro />
        <div className="mt-6 space-y-6">
          <div className={`${shellClass} p-6 sm:p-8`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-rose-700">
                  <CircleHelp className="h-3.5 w-3.5" />
                  Something went wrong
                </div>
                <p className="mt-4 text-sm font-semibold leading-7 text-[color:var(--gh-text-soft)] sm:text-base">
                  {error}
                </p>
              </div>
              <Link
                href="/"
                className="gh-primary-btn inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-black"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        <PageIntro />
        <div className="mt-6">
          <EmptyStateCard
            title="No bookings yet"
            description="Once you reserve a package, your travel dates, status updates, and support actions will show up here in a much cleaner view."
            primaryHref="/"
            primaryLabel="Browse Packages"
            secondaryHref="/contact"
            secondaryLabel="Need Help?"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
      <PageIntro />

      <div className="mt-6 space-y-6">
        {bookings.map((booking) => {
          const packageCount = Array.isArray(booking.packageId) ? booking.packageId.length : booking.packageId ? 1 : 0;

          return (
            <article key={booking._id} className={`${shellClass} p-6 sm:p-8`}>
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-4 border-b border-[color:var(--gh-border)] pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gh-accent-soft)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--gh-accent)]">
                        <Package className="h-3.5 w-3.5" />
                        Booking Record
                      </div>
                      <h2 className="mt-3 text-2xl font-black text-[color:var(--gh-heading)]">
                        {booking.bookingNo || `Booking #${booking._id?.slice(-6).toUpperCase()}`}
                      </h2>
                      <p className="mt-2 text-sm font-semibold text-[color:var(--gh-text-soft)]">
                        Created on {formatDate(booking.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusTone(booking.status)}`}>
                        {booking.status || "REQUESTED"}
                      </span>
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${paymentTone(booking.paymentStatus)}`}>
                        {booking.paymentStatus || "UNPAID"} Payment
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatItem icon={CalendarDays} label="Check-in" value={formatDate(booking.startDate)} />
                    <StatItem icon={CalendarDays} label="Check-out" value={formatDate(booking.endDate)} />
                    <StatItem icon={UserRound} label="Travellers" value={String(booking.travellers || 1)} />
                    <StatItem icon={MapPinned} label="Packages" value={String(packageCount || 1)} />
                  </div>

                  {booking.packageId && booking.packageId.length > 0 ? (
                    <div className="mt-5 rounded-[28px] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.98)] p-4 sm:p-5">
                      <div className="text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--gh-text-soft)]">
                        Included Packages
                      </div>
                      <div className="mt-4 grid gap-3">
                        {booking.packageId.map((pkg, idx) => {
                          const name = typeof pkg === "string" ? `Package ${idx + 1}` : pkg.basic?.name || `Package ${idx + 1}`;

                          return (
                            <div
                              key={idx}
                              className="rounded-[24px] border border-[color:var(--gh-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(255,242,231,0.88))] px-4 py-4"
                            >
                              <div className="text-sm font-black text-[color:var(--gh-heading)]">{name}</div>
                              {pkg.packageCode ? (
                                <div className="mt-1 text-xs font-semibold text-[color:var(--gh-text-soft)]">
                                  Code: {pkg.packageCode}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {booking.note ? (
                    <div className="mt-5 rounded-[28px] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.98)] p-4 sm:p-5">
                      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--gh-text-soft)]">
                        <MessageCircle className="h-4 w-4 text-[color:var(--gh-accent)]" />
                        Special Requests
                      </div>
                      <p className="mt-3 text-sm font-semibold leading-7 text-[color:var(--gh-text)]">{booking.note}</p>
                    </div>
                  ) : null}
                </div>

                <aside className="w-full xl:max-w-[19rem]">
                  <div className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.98)] p-6 shadow-[0_18px_45px_rgba(121,68,44,0.12)]">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gh-accent-soft)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--gh-accent)]">
                      <CreditCard className="h-3.5 w-3.5" />
                      Total Amount
                    </div>
                    <div className="mt-4 text-3xl font-black text-[color:var(--gh-heading)]">
                      {formatCurrency(booking.totalAmount)}
                    </div>
                    <p className="mt-2 text-xs font-semibold text-[color:var(--gh-text-soft)]">
                      Payment and support actions for this booking.
                    </p>

                    <div className="mt-5 space-y-3">
                      {booking.status === "REQUESTED" ? (
                        <a
                          href={`https://wa.me/7505917525?text=I%20have%20a%20booking%20request%20${encodeURIComponent(booking.bookingNo || booking._id)}`}
                          className="gh-primary-btn inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-black"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Contact Support
                        </a>
                      ) : null}
                      <Link
                        href="/"
                        className="inline-flex w-full items-center justify-center rounded-2xl border border-[color:var(--gh-border)] bg-white px-5 py-3 text-sm font-black text-[color:var(--gh-heading)] hover:bg-[color:var(--gh-bg-soft)]"
                      >
                        Continue Browsing
                      </Link>
                    </div>
                  </div>
                </aside>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

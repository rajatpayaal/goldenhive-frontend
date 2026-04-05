"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { getMyBookingsAction } from "@/actions/booking.actions";
import { checkAuthTokenAction } from "@/actions/auth.check";
import { LoginModal } from "@/components/LoginModal";
import Link from "next/link";
import Loader from "@/components/Loader";

export default function BookingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const auth = await checkAuthTokenAction();
        setHasToken(auth.hasToken);
      } catch {
        setHasToken(false);
      }
    };

    checkToken();
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user && !hasToken) {
      setLoading(false);
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

  if (authLoading || (loading && (user || hasToken))) {
    return <Loader message="Loading your bookings..." />;
  }

  if (!user && !hasToken) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-20 text-center">
        <h1 className="text-3xl font-black text-slate-900">My Bookings</h1>
        <p className="mt-4 text-slate-600">Please log in to view your bookings.</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIsLoginOpen(true)}
            className="inline-flex rounded-2xl bg-emerald-500 px-6 py-3 text-white font-bold hover:bg-emerald-600"
          >
            Log In / Sign Up
          </button>
          <Link href="/" className="inline-flex rounded-2xl border border-black/10 bg-white px-6 py-3 text-slate-900 font-bold hover:bg-slate-50">
            Go Home
          </Link>
        </div>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="text-3xl font-black text-slate-900 mb-8">My Bookings</h1>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
        <Link href="/" className="mt-6 inline-flex rounded-2xl bg-emerald-500 px-6 py-3 text-white font-bold hover:bg-emerald-600">
          Go Home
        </Link>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="text-3xl font-black text-slate-900 mb-8">My Bookings</h1>
        <div className="rounded-3xl border border-black/10 bg-slate-50 p-8 text-center">
          <p className="text-lg font-semibold text-slate-600">You don&apos;t have any bookings yet.</p>
          <Link href="/" className="mt-6 inline-flex rounded-2xl bg-emerald-500 px-6 py-3 text-white font-bold hover:bg-emerald-600">
            Browse Packages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-3xl font-black text-slate-900 mb-8">My Bookings</h1>

      <div className="space-y-6">
        {bookings.map((booking) => (
          <div key={booking._id} className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-black text-slate-900">
                      {booking.bookingNo || `Booking #${booking._id?.slice(-6).toUpperCase()}`}
                    </h3>
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                      booking.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-700" :
                      booking.status === "REQUESTED" ? "bg-blue-100 text-blue-700" :
                      booking.status === "CANCELLED" ? "bg-rose-100 text-rose-700" :
                      "bg-slate-100 text-slate-700"
                    }`}>
                      {booking.status || "REQUESTED"}
                    </span>
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                      booking.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-700" :
                      booking.paymentStatus === "UNPAID" ? "bg-yellow-100 text-yellow-700" :
                      "bg-slate-100 text-slate-700"
                    }`}>
                      {booking.paymentStatus || "UNPAID"} Payment
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-xs font-bold text-slate-600">Check-in</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {booking.startDate ? new Date(booking.startDate).toLocaleDateString("en-IN") : "-"}
                    </p>
                  </div>
                  <div>
                    <p className=" text-xs font-bold text-slate-600">Check-out</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {booking.endDate ? new Date(booking.endDate).toLocaleDateString("en-IN") : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600">Travellers</p>
                    <p className="mt-1 font-semibold text-slate-900">{booking.travellers || "1"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600">Packages</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {booking.packageId?.length || 1}
                    </p>
                  </div>
                </div>

                {booking.packageId && booking.packageId.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {booking.packageId.map((pkg, idx) => (
                      <div key={idx} className="rounded-2xl border border-black/5 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {typeof pkg === "string" ? `Package ${idx + 1}` : pkg.basic?.name || `Package ${idx + 1}`}
                        </p>
                        {pkg.packageCode && (
                          <p className="text-xs text-slate-600 mt-1">Code: {pkg.packageCode}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {booking.note && (
                  <div className="mt-4 rounded-2xl border border-black/5 bg-slate-50 p-3">
                    <p className="text-xs font-bold text-slate-600">Special Requests</p>
                    <p className="mt-1 text-sm text-slate-700">{booking.note}</p>
                  </div>
                )}
              </div>

              <div className="md:text-right">
                <div>
                  <p className="text-xs font-bold text-slate-600">Total Amount</p>
                  <p className="mt-1 text-3xl font-black text-slate-900">
                    {booking.totalAmount && booking.totalAmount > 0 ? `₹${booking.totalAmount.toLocaleString("en-IN")}` : "TBA"}
                  </p>
                </div>

                <div className="mt-6 space-y-2">
                  {booking.status === "REQUESTED" && (
                    <a
                      href={`https://wa.me/919999999999?text=I%20have%20a%20booking%20request%20${encodeURIComponent(booking.bookingNo || booking._id)}`}
                      className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Contact Support
                    </a>
                  )}
                  <p className="text-xs text-slate-500 text-center">
                    Created {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString("en-IN") : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link href="/" className="inline-flex rounded-2xl bg-slate-900 px-6 py-3 text-white font-bold hover:bg-slate-700">
          Continue Browsing
        </Link>
      </div>
    </div>
  );
}

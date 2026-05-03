"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBookingByIdAction } from "@/actions/booking.actions";
import Loader from "@/components/Loader";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
  FileText
} from "lucide-react";
import Image from "next/image";

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

export default function BookingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/bookings");
      return;
    }

    const fetchBooking = async () => {
      setLoading(true);
      try {
        const response = await getBookingByIdAction(id);
        if (response.ok) {
          setBooking(response.data?.data || response.data);
        } else {
          setError(response.data?.message || "Failed to load booking details.");
        }
      } catch (err) {
        setError("An error occurred while fetching booking details.");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchBooking();
    }
  }, [id, user, authLoading, router]);

  if (authLoading || loading) return <Loader message="Loading booking details..." />;

  if (error || !booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F9FB] px-4 py-12">
        <XCircle className="h-12 w-12 text-rose-500 mb-4" />
        <h1 className="text-xl font-black text-slate-900">Oops!</h1>
        <p className="mt-2 text-sm text-slate-500 text-center">{error || "Booking not found."}</p>
        <Link href="/bookings" className="mt-6 rounded-full bg-[color:var(--gh-accent)] px-6 py-2.5 text-sm font-bold text-white transition active:scale-95">
          Back to My Trips
        </Link>
      </div>
    );
  }

  const pkg = Array.isArray(booking.packageId) && booking.packageId.length > 0 ? booking.packageId[0] : booking.packageId;
  const isPopulatedPkg = typeof pkg === "object" && pkg !== null;
  const pkgName = isPopulatedPkg ? pkg.basic?.name : "Custom Package";
  const destination = isPopulatedPkg ? pkg.basic?.destination : "";
  const pkgImage = isPopulatedPkg ? (pkg.images?.primary?.url || pkg.images?.gallery?.[0]?.url) : null;
  
  const status = booking.status?.toUpperCase() || "UPCOMING";
  const paymentStatus = booking.paymentStatus?.toUpperCase() || "UNPAID";
  const bookingNo = booking.bookingNo || booking._id?.slice(-10).toUpperCase();

  return (
    <main className="min-h-screen bg-[#F8F9FB] pb-24 md:pb-32">
      {/* App Bar */}
      <div className="sticky top-0 z-40 flex items-center bg-white/90 px-4 py-4 backdrop-blur-md shadow-sm border-b border-black/5 md:px-8">
        <Link href="/bookings" className="mr-3 text-slate-900 transition hover:opacity-70">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-[15px] font-black text-slate-900">Booking Details</span>
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-6 md:px-8 md:pt-10">
        
        {/* Header / ID */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Booking ID</p>
            <h1 className="text-xl font-black text-slate-900 md:text-2xl">{bookingNo}</h1>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
              status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
              status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
              status === 'COMPLETED' ? 'bg-slate-200 text-slate-700' :
              'bg-[color:var(--gh-accent-soft)] text-[color:var(--gh-accent)]'
            }`}>
              {status === 'CONFIRMED' ? <CheckCircle2 className="h-3 w-3" /> :
               status === 'CANCELLED' ? <XCircle className="h-3 w-3" /> :
               <Clock className="h-3 w-3" />}
              {status}
            </span>
          </div>
        </div>

        {/* Package Card Summary */}
        <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-100">
          {pkgImage && (
            <div className="relative h-40 w-full bg-slate-100 md:h-56">
              <Image src={pkgImage} alt={pkgName} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                {destination && (
                  <p className="flex items-center gap-1 text-[11px] font-bold text-white/80">
                    <MapPin className="h-3 w-3" /> {destination}
                  </p>
                )}
                <h2 className="text-lg font-black leading-tight text-white md:text-2xl">{pkgName}</h2>
              </div>
            </div>
          )}
          {!pkgImage && (
            <div className="bg-[linear-gradient(135deg,#1e3a5f,#2d6a9f)] p-6 text-white">
              {destination && (
                <p className="flex items-center gap-1 text-[11px] font-bold text-white/80">
                  <MapPin className="h-3 w-3" /> {destination}
                </p>
              )}
              <h2 className="mt-1 text-lg font-black leading-tight md:text-2xl">{pkgName}</h2>
            </div>
          )}
          
          <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 sm:grid-cols-4 sm:divide-y-0">
            <div className="p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Check In</p>
              <p className="mt-1 text-sm font-black text-slate-800">{formatDate(booking.startDate)}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Check Out</p>
              <p className="mt-1 text-sm font-black text-slate-800">{formatDate(booking.endDate)}</p>
            </div>
            <div className="p-4 text-center border-t border-slate-100 sm:border-t-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Travellers</p>
              <p className="mt-1 text-sm font-black text-slate-800 flex justify-center items-center gap-1">
                <Users className="h-4 w-4 text-[color:var(--gh-accent)]" /> {booking.travellers || 1}
              </p>
            </div>
            <div className="p-4 text-center border-t border-slate-100 sm:border-t-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount</p>
              <p className="mt-1 text-sm font-black text-[color:var(--gh-accent)]">{formatCurrency(booking.totalAmount)}</p>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
          <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" /> Primary Contact
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Full Name</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">{booking.contactDetails?.firstName} {booking.contactDetails?.lastName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Email Address</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" /> {booking.contactDetails?.email || "-"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Mobile Number</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" /> {booking.contactDetails?.mobile || "-"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Additional Requests</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {booking.specialRequests || "None"}
              </p>
            </div>
          </div>
        </div>

        {/* Payment & Invoice */}
        <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-slate-400" /> Payment Info
            </h3>
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black ${
              paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-orange-100 text-orange-700 border-orange-200'
            }`}>
              {paymentStatus}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-slate-500">Base Amount</span>
              <span className="font-black text-slate-800">{formatCurrency(booking.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-slate-500">Taxes & Fees</span>
              <span className="font-black text-slate-800">Included</span>
            </div>
            <div className="my-2 border-t border-dashed border-slate-200" />
            <div className="flex justify-between text-base">
              <span className="font-black text-slate-900">Total Paid</span>
              <span className="font-black text-[color:var(--gh-accent)]">{formatCurrency(booking.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

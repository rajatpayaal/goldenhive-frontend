"use client";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBookingByIdAction } from "@/actions/booking.actions";
import Loader from "@/components/Loader";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Calendar,
  ChevronRight,
  CreditCard,
  Download,
  Edit2,
  FileText,
  Handshake,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  MoreVertical,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  User,
  Users,
  Wallet,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Navigation
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
  if (!Number.isFinite(amount)) return "₹ 0";
  try {
    return `₹ ${new Intl.NumberFormat("en-IN").format(amount)}`;
  } catch {
    return `₹ ${amount}`;
  }
};

const TIMELINE_ICONS = {
  contacted: MessageSquare,
  negotiation: Handshake,
  pending_payment: Wallet,
  token_paid: FileText,
  confirmed: CreditCard,
  verification_pending: ShieldCheck,
  completed: CheckCircle2,
};

export default function BookingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

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

  if (authLoading || loading) return <Loader message="Loading your booking..." />;

  if (error || !booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F9FB] px-4 py-12">
        <div className="relative mb-6">
          <div className="absolute inset-0 scale-150 rounded-full bg-rose-50 blur-2xl" />
          <XCircle className="relative h-16 w-16 text-rose-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Oops!</h1>
        <p className="mt-2 text-slate-500 text-center max-w-xs">{error || "We couldn't find the booking you're looking for."}</p>
        <Link href="/bookings" className="mt-8 rounded-2xl bg-slate-900 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-200 transition active:scale-95">
          Back to Bookings
        </Link>
      </div>
    );
  }

  // Data mapping from real API response
  const pkgItems = booking.packageItems || [];
  const primaryPkgItem = pkgItems[0];
  const primaryPkg = typeof primaryPkgItem?.packageId === 'object' ? primaryPkgItem?.packageId : null;
  const isMultiPackage = pkgItems.length > 1;

  // Normalize each item's packageId to an object (may be just a string ID if not populated)
  const normalizedItems = pkgItems.map((item, i) => ({
    ...item,
    pkg: typeof item.packageId === 'object' ? item.packageId : null,
  }));

  // Package Name logic
  const allPkgNames = normalizedItems.map((item, i) => item.pkg?.basic?.name || `Package ${i + 1}`);
  const pkgName = isMultiPackage
    ? allPkgNames.join(' + ')
    : allPkgNames[0] || 'Custom Package';

  const pkgImage = primaryPkg?.images?.primary?.url || primaryPkg?.images?.gallery?.[0]?.url || '/placeholder-travel.jpg';
  
  const bookingNo = booking.bookingNo || `GHY-${id.slice(-6).toUpperCase()}`;
  const travellersCount = booking.travellers || 1;
  const startDate = booking.startDate;
  const endDate = booking.endDate;
  const createdAt = booking.createdAt;

  const paymentInfo = booking.payment || {};
  const timeline = booking.timeline || [];
  const bookingActions = booking.actions || {};
  const pricingSummary = booking.pricingSummary || {};
  const destination = booking.packageId?.basic?.destination || primaryPkg?.basic?.destination || normalizedItems.map(i => i.pkg?.basic?.destination).filter(Boolean)[0] || "";

  const handleDownloadInvoice = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/bookings/${id}/invoice`);
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === "INVOICE_AVAILABLE_AFTER_FULL_PAYMENT") {
          showToast({ type: "warning", title: "Invoice Unavailable", message: "Invoice is available only after full payment is completed." });
        } else {
          showToast({ type: "error", title: "Download Failed", message: errorData.message || "Failed to download invoice. Please try again later." });
        }
        return;
      }

      // Handle success: response is a PDF blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${bookingNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast({ type: "error", title: "Download Failed", message: "An error occurred while downloading the invoice." });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFDFF] pb-32">
      <div className="mx-auto max-w-3xl px-4 pt-6">
        {/* Simple Back Button */}
        <div className="mb-6 flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-900 transition hover:bg-slate-100 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-black text-slate-900">Booking Details</span>
        </div>

        {/* Booking Card Top */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="flex flex-col gap-5 sm:flex-row">
            {/* Image(s) */}
            {isMultiPackage ? (
              <div className={`grid shrink-0 gap-1.5 overflow-hidden rounded-[2rem] sm:h-44 sm:w-44 w-full h-40 ${
                pkgItems.length === 2 ? 'grid-cols-2' : 'grid-cols-2'
              }`}>
                {normalizedItems.slice(0, pkgItems.length === 2 ? 2 : 4).map((item, i) => {
                  const imgUrl = item.pkg?.images?.primary?.url || null;
                  return (
                    <div key={i} className="relative overflow-hidden bg-slate-100">
                      {imgUrl ? (
                        <Image src={imgUrl} alt={item.pkg?.basic?.name || ''} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-100">
                          <span className="text-xs font-black text-slate-400">{i + 1}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-[2rem] sm:h-44 sm:w-44">
                <Image src={pkgImage} alt={pkgName} fill className="object-cover" />
              </div>
            )}
            <div className="flex flex-1 flex-col justify-between py-1">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[color:var(--gh-accent)]">Booking ID</p>
                    <h2 className="text-sm font-black text-slate-900">{bookingNo}</h2>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right">
                    <div className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-black ${
                      booking.paymentStatus?.toLowerCase() === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {booking.paymentStatus?.toLowerCase() === 'paid' ? <CheckCircle2 className="h-3 w-3" /> : <Wallet className="h-3 w-3" />}
                      <span>{booking.userStatusLabel || booking.paymentStatus?.toUpperCase() || 'REQUESTED'}</span>
                    </div>
                  </div>
                </div>
                <h1 className="mt-3 text-xl font-black leading-tight text-slate-900 sm:text-2xl line-clamp-3">{pkgName}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>{formatDate(startDate)} {endDate ? `– ${formatDate(endDate)}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span>{travellersCount} {travellersCount === 1 ? 'Traveller' : 'Travellers'}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400">Booking Date</p>
                  <p className="text-xs font-black text-slate-900">{formatDate(createdAt)}</p>
                </div>
                {isMultiPackage ? (
                   <div className="flex items-center gap-1.5">
                     <span className="rounded-xl bg-rose-50 px-3 py-1.5 text-[10px] font-black text-rose-500">{pkgItems.length} Packages</span>
                   </div>
                ) : (
                  <button className="rounded-xl border border-rose-100 px-5 py-2 text-xs font-black text-rose-500 transition hover:bg-rose-50">
                    View Details
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Progress */}
        {timeline.length > 0 && (
          <div className="mt-8">
            <h3 className="text-base font-black text-slate-900 px-1">Booking Progress</h3>
            <div className="mt-6 relative px-1">
              <div className="no-scrollbar flex items-start gap-0 overflow-x-auto pb-4">
                {timeline.map((step, idx) => {
                  const Icon = TIMELINE_ICONS[step.key] || MessageSquare;
                  const visualStatus = step.completed ? 'completed' : step.active ? 'active' : 'pending';

                  return (
                    <div key={idx} className="flex min-w-[120px] flex-col items-center text-center">
                      <div className="relative flex w-full items-center justify-center">
                        {/* Line segments */}
                        {idx > 0 && (
                          <div className={`absolute right-1/2 top-6 h-[2px] w-full ${timeline[idx-1].completed ? 'bg-rose-400' : 'bg-slate-100'}`} />
                        )}
                        {idx < timeline.length - 1 && (
                          <div className={`absolute left-1/2 top-6 h-[2px] w-full ${step.completed ? 'bg-rose-400' : 'bg-slate-100'}`} />
                        )}
                        
                        {/* Circle */}
                        <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-sm transition-all ${
                          visualStatus === 'completed' ? 'border-rose-500 bg-rose-500 text-white' : 
                          visualStatus === 'active' ? 'border-rose-400 bg-white text-rose-500 scale-110 shadow-rose-100 ring-4 ring-rose-50' : 
                          'border-slate-100 bg-white text-slate-300'
                        }`}>
                          <Icon className="h-5 w-5" strokeWidth={2.5} />
                          {visualStatus === 'completed' && (
                             <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-1 ring-rose-500">
                               <CheckCircle2 className="h-3 w-3 text-rose-500" fill="currentColor" />
                             </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 px-2">
                        <p className={`text-[10px] font-black leading-tight ${visualStatus === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>{step.label}</p>
                        {step.date && <p className="mt-1 text-[9px] font-bold text-slate-400">{formatDate(step.date)}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Traveller Details */}
        <div className="mt-10">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-black text-slate-900">Traveller Details <span className="text-slate-400 font-bold ml-1">({booking.travelerDetails?.length || travellersCount} Travellers)</span></h3>
          </div>
          
          <div className="mt-4 space-y-4">
             {booking.travelerDetails && booking.travelerDetails.length > 0 ? (
               booking.travelerDetails.map((traveller, idx) => (
                 <div key={idx} className="group relative rounded-3xl bg-white p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500 font-black text-sm">
                          {traveller.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "TR"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-black text-slate-900">{traveller.name}</h4>
                            <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-600 uppercase tracking-wider">{traveller.type || 'Adult'}</span>
                          </div>
                          <p className="mt-0.5 text-xs font-bold text-slate-400">{traveller.age} Years • {traveller.gender || "—"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Phone className="h-3.5 w-3.5 text-slate-300" />
                        <span>{traveller.phone || "+91 XXXXX XXXXX"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Mail className="h-3.5 w-3.5 text-slate-300" />
                        <span>{traveller.email || "—"}</span>
                      </div>
                    </div>
                 </div>
               ))
             ) : (
               /* Empty State */
               <div className="rounded-3xl bg-slate-50 p-8 text-center border border-dashed border-slate-200">
                  <p className="text-sm font-bold text-slate-400">No traveller details added yet.</p>
               </div>
             )}

             <button className="w-full flex items-center justify-center gap-2 py-2 text-xs font-black text-rose-500 transition hover:opacity-80">
               View All Travellers <ChevronDown className="h-4 w-4" />
             </button>
          </div>
        </div>

        {/* Summary & Actions Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {/* Payment Summary */}
          <div className="rounded-[2rem] bg-white p-6 border border-slate-100 shadow-sm">
            <h3 className="text-base font-black text-slate-900">Payment Summary</h3>
            <div className="mt-6 grid grid-cols-2 gap-y-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Base Amount</p>
                <p className="mt-1 text-lg font-black text-slate-900">{formatCurrency(pricingSummary.baseAmount || booking.baseAmount)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount</p>
                <p className={`mt-1 text-lg font-black ${Number(pricingSummary.discountAmount || booking.discountAmount) > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  - {formatCurrency(pricingSummary.discountAmount || booking.discountAmount || 0)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</p>
                <p className="mt-1 text-lg font-black text-slate-900">{formatCurrency(paymentInfo.total_amount || booking.totalAmount)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Token Required</p>
                <p className={`mt-1 text-lg font-black ${Number(paymentInfo.expected_token_amount) > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {formatCurrency(paymentInfo.expected_token_amount || 0)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid Amount</p>
                <p className="mt-1 text-base font-black text-emerald-600">{formatCurrency(paymentInfo.paid_amount || 0)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remaining Amount</p>
                <p className="mt-1 text-base font-black text-orange-500">{formatCurrency(paymentInfo.remaining_amount || 0)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Status</p>
                <span className={`mt-1 inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase ${
                  paymentInfo.payment_status?.toLowerCase() === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                }`}>
                  {paymentInfo.payment_status || booking.paymentStatus || "PENDING"}
                </span>
              </div>
            </div>
          </div>

          {/* Booking Actions */}
          <div className="rounded-[2rem] bg-white p-6 border border-slate-100 shadow-sm">
            <h3 className="text-base font-black text-slate-900">Booking Actions</h3>
            <div className="mt-6 space-y-2">
              {[
                { label: isDownloading ? "Downloading..." : "Download Invoice", icon: FileText, color: "text-rose-500", bg: "bg-rose-50", onClick: handleDownloadInvoice, disabled: isDownloading },
                { label: "Contact Support", icon: MessageCircle, color: "text-purple-500", bg: "bg-purple-50" },
              ].map((action, i) => (
                <button 
                  key={i} 
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`flex w-full items-center justify-between rounded-2xl p-3 transition hover:bg-slate-50 ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.bg} ${action.color}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className={`text-sm font-bold ${action.textClass || 'text-slate-700'}`}>{action.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Package Items */}
        {pkgItems.length > 0 && (
          <div className="mt-10">
            <h3 className="text-base font-black text-slate-900 px-1">Selected Services</h3>
            <div className="mt-4 space-y-3">
              {normalizedItems.map((item, i) => {
                const itemName = item.pkg?.basic?.name || `Package ${i + 1}`;
                const itemImage = item.pkg?.images?.primary?.url || null;
                return (
                <div key={i} className="flex items-center justify-between rounded-3xl bg-white p-4 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                      {itemImage ? (
                        <Image src={itemImage} alt="" fill className="rounded-2xl object-cover" />
                      ) : (
                        <Navigation className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{itemName}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Qty: {item.travellers} • Unit Price: {formatCurrency(item.unitPrice)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{formatCurrency(item.itemTotal)}</p>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Booking Information Grid */}
        <div className="mt-10">
          <h3 className="text-base font-black text-slate-900 px-1">Booking Information</h3>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
             {[
               { label: "Destination", value: destination || "—", icon: MapPin, bg: "bg-rose-50", color: "text-rose-500" },
               { label: "Pickup Point", value: booking.pickupPoint || "—", icon: Navigation, bg: "bg-rose-50", color: "text-rose-500" },
               { label: "Trip Type", value: booking.tripType || "—", icon: Navigation, bg: "bg-rose-50", color: "text-rose-500" },
               { label: "Package Type", value: booking.packageType || "—", icon: Users, bg: "bg-rose-50", color: "text-rose-500" }
             ].map((info, i) => (
               <div key={i} className="flex items-center gap-3 rounded-2xl bg-white p-3 border border-slate-50 shadow-sm">
                 <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${info.bg} ${info.color}`}>
                   <info.icon className="h-5 w-5" />
                 </div>
                 <div>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{info.label}</p>
                   <p className="text-[11px] font-black text-slate-900 truncate">{info.value}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Need Help? Section */}
        <div className="mt-10 rounded-[2.5rem] bg-rose-50/30 p-6 border border-rose-100/50">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-rose-500 shadow-md ring-8 ring-rose-50">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900">Need Help?</h4>
                <p className="text-sm font-bold text-slate-500">Our travel experts are here for you 24x7</p>
              </div>
            </div>
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-3 text-sm font-black text-white shadow-lg shadow-green-100 transition hover:opacity-90 active:scale-95 sm:flex-none">
                <MessageSquare className="h-5 w-5" /> WhatsApp
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-white px-6 py-3 text-sm font-black text-rose-500 transition hover:bg-rose-50 active:scale-95 sm:flex-none">
                <Phone className="h-5 w-5" /> Call Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

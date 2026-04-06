"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { getCartAction } from "@/actions/cart.actions";
import { createBookingAction } from "@/actions/booking.actions";
import { checkAuthTokenAction } from "@/actions/auth.check";
import { LoginModal } from "@/components/LoginModal";
import Link from "next/link";
import Image from "next/image";
import Loader from "@/components/Loader";

export default function BookingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // Booking form data
  const [bookingData, setBookingData] = useState({
    startDate: "",
    endDate: "",
    travellers: 1,
    note: "",
  });

  // Traveler details
  const [travelerDetails, setTravelerDetails] = useState([
    { name: "", age: "", email: "", phone: "" }
  ]);

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
    if (authLoading) return;

    if (!user && !hasToken) {
      setLoading(false);
      return;
    }

    const fetchCart = async () => {
      setLoading(true);
      try {
        const response = await getCartAction();
        if (response.ok) {
          const packages = response.data?.data?.packageId || [];
          setCartItems(packages);
          const travelerCount = Math.max(1, packages.length);
          setBookingData(prev => ({ ...prev, travellers: travelerCount }));
          // Initialize traveler details based on number of packages/travelers
          setTravelerDetails(Array(travelerCount).fill().map(() => ({
            name: "", age: "", email: "", phone: ""
          })));
        } else {
          setError(response.data?.message || response.data?.error || "Failed to load cart.");
        }
      } catch {
        setError("Failed to load cart. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [authLoading, user, hasToken]);

  // Ensure travelers count is always valid
  useEffect(() => {
    if (bookingData.travellers < 1 || isNaN(bookingData.travellers)) {
      setBookingData(prev => ({ ...prev, travellers: 1 }));
    }
  }, [bookingData.travellers]);

  // Ensure traveler details array matches travelers count
  useEffect(() => {
    const currentCount = travelerDetails.length;
    const targetCount = Math.max(1, bookingData.travellers);

    if (currentCount !== targetCount) {
      setTravelerDetails(prev => {
        const updated = [...prev];
        if (targetCount > currentCount) {
          // Add more travelers
          while (updated.length < targetCount) {
            updated.push({ name: "", age: "", email: "", phone: "" });
          }
        } else {
          // Remove travelers
          updated.splice(targetCount);
        }
        return updated;
      });
    }
  }, [bookingData.travellers, travelerDetails.length]);

  const handleBookingDataChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: name === "travellers" ? (parseInt(value, 10) || 1) : value,
    }));

    // Update traveler details array when travelers count changes
    if (name === "travellers") {
      const newCount = parseInt(value, 10) || 1;
      setTravelerDetails(prev => {
        const current = [...prev];
        if (newCount > current.length) {
          // Add more travelers
          while (current.length < newCount) {
            current.push({ name: "", age: "", email: "", phone: "" });
          }
        } else if (newCount < current.length) {
          // Remove travelers
          current.splice(newCount);
        }
        return current;
      });
    }
  };

  const handleTravelerChange = (index, field, value) => {
    setTravelerDetails(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const validateForm = () => {
    if (!bookingData.startDate ) {
      setError("Please select check-in date.");
      return false;
    }

    // if (new Date(bookingData.startDate) >= new Date(bookingData.endDate)) {
    //   setError("Check-out date must be after check-in date.");
    //   return false;
    // }

    if (bookingData.travellers <= 0) {
      setError("Number of travelers must be at least 1.");
      return false;
    }

    // Validate traveler details
    for (let i = 0; i < bookingData.travellers; i++) {
      const traveler = travelerDetails[i];
      if (!traveler.name.trim()) {
        setError(`Please enter name for Traveler ${i + 1}.`);
        return false;
      }
      if (!traveler.age || traveler.age < 1 || traveler.age > 120) {
        setError(`Please enter valid age for Traveler ${i + 1}.`);
        return false;
      }
      if (!traveler.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(traveler.email)) {
        setError(`Please enter valid email for Traveler ${i + 1}.`);
        return false;
      }
      if (!traveler.phone.trim() || !/^[6-9]\d{9}$/.test(traveler.phone.replace(/\s+/g, ''))) {
        setError(`Please enter valid 10-digit phone number for Traveler ${i + 1}.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setError("");

    try {
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.basic?.finalPrice || 0), 0) * bookingData.travellers;

      const payload = {
        ...bookingData,
        packageId: cartItems.map(item => item._id),
        userId: user._id,
        totalAmount,
        travelerDetails,
      };

      const response = await createBookingAction(payload);

      if (response.ok) {
        setSuccess(true);
        // Clear cart after successful booking
        setCartItems([]);
      } else {
        setError(response.data?.message || response.data?.error || "Failed to create booking");
      }
    } catch (err) {
      setError("Error creating booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <Loader message="Loading booking details..." />;
  }

  if (!user && !hasToken) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-20 text-center">
        <h1 className="text-3xl font-black text-slate-900">Create Booking</h1>
        <p className="mt-4 text-slate-600">Please log in to create a booking.</p>
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

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-20 text-center">
        <h1 className="text-3xl font-black text-slate-900">Create Booking</h1>
        <div className="mt-10 rounded-3xl border border-black/10 bg-slate-50 p-8">
          <p className="text-lg font-semibold text-slate-600">Your cart is empty.</p>
          <p className="mt-2 text-sm text-slate-500">Add packages to your cart before booking.</p>
          <Link href="/" className="mt-6 inline-flex rounded-2xl bg-emerald-500 px-6 py-3 text-white font-bold hover:bg-emerald-600">
            Browse Packages
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-20 text-center">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8">
          <div className="text-6xl text-emerald-600">✓</div>
          <h1 className="mt-4 text-3xl font-black text-slate-900">Booking Confirmed!</h1>
          <p className="mt-2 text-slate-600">
            Your booking has been created successfully. You will receive a confirmation email shortly.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/bookings"
              className="inline-flex rounded-2xl bg-emerald-500 px-6 py-3 text-white font-bold hover:bg-emerald-600"
            >
              View My Bookings
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-2xl border border-black/10 bg-white px-6 py-3 text-slate-900 font-bold hover:bg-slate-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.basic?.finalPrice || 0), 0) * bookingData.travellers;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Create Booking</h1>

      <form onSubmit={handleSubmitBooking} className="grid gap-8 lg:grid-cols-3">
        {/* Package Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-black/10 bg-white p-6">
            <h2 className="text-xl font-black text-slate-900 mb-4">Selected Packages</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center gap-4 rounded-2xl border border-black/5 bg-slate-50 p-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                    {item.images?.primary?.url && (
                      <Image
                        src={item.images.primary.url}
                        alt={item.basic?.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{item.basic?.name}</h3>
                    <p className="text-sm text-slate-600">₹{item.basic?.finalPrice?.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traveler Details */}
          <div className="rounded-3xl border border-black/10 bg-white p-6">
            <h2 className="text-xl font-black text-slate-900 mb-4">Traveler Details</h2>
            <div className="space-y-6">
              {travelerDetails.map((traveler, index) => (
                <div key={index} className="rounded-2xl border border-black/5 bg-slate-50 p-4">
                  <h3 className="font-bold text-slate-900 mb-3">Traveler {index + 1}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={traveler.name}
                        onChange={(e) => handleTravelerChange(index, 'name', e.target.value)}
                        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Age *</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={traveler.age}
                        onChange={(e) => handleTravelerChange(index, 'age', e.target.value)}
                        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                        placeholder="Enter age"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={traveler.email}
                        onChange={(e) => handleTravelerChange(index, 'email', e.target.value)}
                        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        value={traveler.phone}
                        onChange={(e) => handleTravelerChange(index, 'phone', e.target.value)}
                        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                        placeholder="Enter 10-digit phone number"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-black/10 bg-white p-6 lg:sticky lg:top-28">
            <h2 className="text-xl font-black text-slate-900 mb-4">Booking Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Check-in Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={bookingData.startDate}
                  onChange={handleBookingDataChange}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Check-out Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={bookingData.endDate}
                  onChange={handleBookingDataChange}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  required
                />
              </div> */}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Number of Travelers *</label>
                <input
                  type="number"
                  name="travellers"
                  min="1"
                  value={bookingData.travellers || 1}
                  onChange={handleBookingDataChange}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Special Requests</label>
                <textarea
                  name="note"
                  value={bookingData.note}
                  onChange={handleBookingDataChange}
                  placeholder="Any special requests..."
                  rows="3"
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {error}
              </div>
            )}

            <div className="mt-6 border-t border-black/5 pt-4">
              <div className="flex justify-between items-center text-lg font-black text-slate-900 mb-4">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-white hover:bg-emerald-600 disabled:opacity-60"
              >
                {submitting ? "Creating Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createBookingAction } from "@/actions/booking.actions";

export function BookingModal({ isOpen, onClose, packages = [], onSuccess }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: details, 2: review, 3: confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingData, setBookingData] = useState({
    startDate: "",
    endDate: "",
    travellers: 1,
    note: "",
    status: "REQUESTED",
    paymentStatus: "UNPAID",
  });

  if (!isOpen) return null;

  const totalAmount = packages.reduce((sum, pkg) => sum + (pkg.basic?.finalPrice || 0), 0) * bookingData.travellers;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: name === "travellers" ? parseInt(value, 10) : value,
    }));
  };

  const handleCreateBooking = async () => {
    if (!bookingData.startDate || !bookingData.endDate || bookingData.travellers <= 0) {
      setError("Please fill all required fields");
      return;
    }

    if (new Date(bookingData.startDate) >= new Date(bookingData.endDate)) {
      setError("End date must be after start date");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        ...bookingData,
        packageId: packages.map((pkg) => pkg._id),
        userId: user._id,
        totalAmount,
      };

      const response = await createBookingAction(payload);

      if (response.ok) {
        setStep(3);
        setTimeout(() => {
          onSuccess?.();
          onClose();
          setStep(1);
          setBookingData({
            startDate: "",
            endDate: "",
            travellers: 1,
            note: "",
            status: "REQUESTED",
            paymentStatus: "UNPAID",
          });
        }, 2000);
      } else {
        setError(response.data?.message || response.data?.error || "Failed to create booking");
      }
    } catch (err) {
      setError("Error creating booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-5 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_18px_45px_rgba(2,6,23,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-xl font-black text-slate-900 hover:bg-slate-50"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="bg-gradient-to-br from-slate-950 to-slate-900 px-8 py-7 text-white">
          <div className="text-2xl font-black tracking-tight">Complete Booking</div>
          <div className="mt-1 text-sm font-semibold text-white/80">Step {step} of 3</div>
        </div>

        <div className="px-8 py-7">
          {step === 3 ? (
            <div className="py-10 text-center">
              <div className="text-5xl">✓</div>
              <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-900">Booking Confirmed!</h2>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                Your booking has been created successfully.
              </p>
            </div>
          ) : step === 2 ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-4">Review Your Booking</h3>

                <div className="space-y-3">
                  {packages.map((pkg) => (
                    <div
                      key={pkg._id}
                      className="rounded-2xl border border-black/5 bg-slate-50 p-4"
                    >
                      <p className="font-bold text-slate-900">{pkg.basic?.name}</p>
                      <p className="text-sm text-slate-600">
                        ₹{pkg.basic?.finalPrice?.toLocaleString("en-IN")} × {bookingData.travellers} traveller{bookingData.travellers > 1 ? "s" : ""}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-black/5 pt-4">
                  <div className="flex justify-between items-center text-lg font-black text-slate-900">
                    <span>Total Amount:</span>
                    <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-3 rounded-2xl border border-black/5 bg-slate-50 p-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600">Check-in Date</label>
                    <p className="mt-1 font-semibold text-slate-900">
                      {new Date(bookingData.startDate).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">Check-out Date</label>
                    <p className="mt-1 font-semibold text-slate-900">
                      {new Date(bookingData.endDate).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">Number of Travellers</label>
                    <p className="mt-1 font-semibold text-slate-900">{bookingData.travellers}</p>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-black text-slate-900 hover:bg-slate-50"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  onClick={handleCreateBooking}
                  disabled={loading}
                  className="flex-1 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-white hover:bg-emerald-600 disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Check-in Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={bookingData.startDate}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Check-out Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={bookingData.endDate}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Number of Travellers *</label>
                <input
                  type="number"
                  name="travellers"
                  min="1"
                  value={bookingData.travellers}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Special Requests (Optional)</label>
                <textarea
                  name="note"
                  value={bookingData.note}
                  onChange={handleInputChange}
                  placeholder="Any special requests or notes..."
                  rows="3"
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-black text-slate-900 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-white hover:bg-emerald-600"
                >
                  Review Booking
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

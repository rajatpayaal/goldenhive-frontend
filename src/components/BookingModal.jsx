"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createBookingAction } from "@/actions/booking.actions";

export function BookingModal({ isOpen, onClose, packages = [], onSuccess }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: details, 2: review, 3: confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [packageTravellers, setPackageTravellers] = useState({});
  const [bookingData, setBookingData] = useState({
    startDate: "",
    endDate: "",
    travellers: 1,
    note: "",
    status: "REQUESTED",
    paymentStatus: "UNPAID",
  });

  useEffect(() => {
    if (!isOpen) return;
    setPackageTravellers((prev) => {
      const next = { ...prev };
      for (const pkg of packages) {
        if (!pkg?._id) continue;
        if (next[pkg._id] == null) next[pkg._id] = 1;
      }
      return next;
    });
  }, [isOpen, packages]);

  const totalTravellers = useMemo(() => {
    const values = packages.map((pkg) => Math.max(1, Number(packageTravellers[pkg?._id] || 1)));
    return values.length > 0 ? Math.max(...values) : 1;
  }, [packages, packageTravellers]);

  const totalAmount = useMemo(() => {
    return packages.reduce((sum, pkg) => {
      const price = Number(pkg.basic?.finalPrice || 0);
      const qty = Math.max(1, Number(packageTravellers[pkg?._id] || 1));
      return sum + price * qty;
    }, 0);
  }, [packages, packageTravellers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: name === "travellers" ? parseInt(value, 10) : value,
    }));
  };

  const handleCreateBooking = async () => {
    if (!bookingData.startDate || !bookingData.endDate || totalTravellers <= 0) {
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
      const packageItems = packages
        .filter((pkg) => pkg?._id)
        .map((pkg) => ({
          packageId: pkg._id,
          travellers: Math.max(1, Number(packageTravellers[pkg._id] || 1)),
          travelerDetails: [],
        }));

      const payload = {
        ...bookingData,
        packageId: packages.map((pkg) => pkg._id),
        packageItems,
        travellers: totalTravellers,
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-5 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_18px_45px_rgba(2,6,23,0.22)] max-h-[calc(100vh-3.5rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-xl font-black text-slate-900 hover:bg-slate-50"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="bg-gradient-to-br from-slate-950 to-slate-900 px-6 py-6 text-white sm:px-8 sm:py-7">
          <div className="text-2xl font-black tracking-tight">Complete Booking</div>
          <div className="mt-1 text-sm font-semibold text-white/80">Step {step} of 3</div>
        </div>

        <div
          className="px-6 py-6 overflow-y-auto sm:px-8 sm:py-7"
          style={{ maxHeight: "calc(100vh - 10.5rem)" }}
        >
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
                        ₹{pkg.basic?.finalPrice?.toLocaleString("en-IN")} × {Math.max(1, Number(packageTravellers[pkg._id] || 1))} traveller{Math.max(1, Number(packageTravellers[pkg._id] || 1)) > 1 ? "s" : ""}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-black/5 pt-4">
                  <div className="flex justify-between items-center text-lg font-black text-slate-900">
                    <span>Total Amount:</span>
                    <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="mt-1 flex justify-between items-center text-sm font-semibold text-slate-600">
                    <span>Total travellers (max):</span>
                    <span className="font-black text-slate-900">{totalTravellers}</span>
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
                    <p className="mt-1 font-semibold text-slate-900">{totalTravellers}</p>
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
                <label className="block text-sm font-bold text-slate-900 mb-3">Travellers per package *</label>
                <div className="space-y-3">
                  {packages.map((pkg) => (
                    <div
                      key={pkg._id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-black text-slate-900 truncate">{pkg.basic?.name || "Package"}</div>
                        <div className="text-xs font-semibold text-slate-500">
                          ₹{Number(pkg.basic?.finalPrice || 0).toLocaleString("en-IN")} per traveller
                        </div>
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={Math.max(1, Number(packageTravellers[pkg._id] || 1))}
                        onChange={(e) => {
                          const value = Math.max(1, parseInt(e.target.value, 10) || 1);
                          setPackageTravellers((prev) => ({ ...prev, [pkg._id]: value }));
                        }}
                        className="h-11 w-24 rounded-2xl border border-black/10 bg-white px-3 text-sm font-black text-slate-900 outline-none focus:border-emerald-500"
                        aria-label={`Travellers for ${pkg.basic?.name || "package"}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between rounded-2xl border border-black/5 bg-slate-50 px-4 py-3">
                  <div className="text-sm font-bold text-slate-900">Total travellers (max)</div>
                  <div className="text-lg font-black text-slate-900">{totalTravellers}</div>
                </div>
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

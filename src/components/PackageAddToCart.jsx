"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { addToCartAction } from "@/actions/cart.actions";
import { BookingModal } from "./BookingModal";
import { LoginModal } from "./LoginModal";

export function PackageAddToCart({ packageId, packageName, packageData }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsSuccess(false);

    try {
      const response = await addToCartAction(packageId);
      
      if (response.ok) {
        setMessage(`${packageName} added to cart!`);
        setIsSuccess(true);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("gh_cart_updated"));
        }
      } else {
        setMessage(response.data?.message || response.data?.error || "Failed to add to cart");
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage("Error adding to cart");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleAddToCart}
          disabled={loading}
          className={`inline-flex items-center justify-center rounded-2xl px-5 py-4 text-base font-black shadow-[0_14px_30px_rgba(16,185,129,0.35)] transition ${
            !user
              ? "bg-slate-200 text-slate-500"
              : isSuccess
                ? "bg-sky-500 text-white hover:bg-sky-600"
                : "bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60"
          }`}
        >
          {loading ? "Adding..." : isSuccess ? "✓ Added" : "🛒 Add to Cart"}
        </button>

        <button
          onClick={() => {
            if (!user) {
              setIsLoginOpen(true);
              return;
            }
            setIsBookingOpen(true);
          }}
          className={`inline-flex items-center justify-center rounded-2xl px-5 py-4 text-base font-black shadow-[0_14px_30px_rgba(14,165,233,0.35)] transition ${
            !user
              ? "bg-slate-200 text-slate-500"
              : "bg-sky-500 text-white hover:bg-sky-600"
          }`}
          type="button"
        >
          ✈️ Book Now
        </button>
      </div>

      {message && (
        <div className={`mt-3 rounded-2xl px-4 py-3 text-sm font-semibold text-center ${
          isSuccess
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-rose-50 text-rose-700 border border-rose-200"
        }`}>
          {message}
        </div>
      )}

      <BookingModal 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        packages={packageData ? [packageData] : []}
        onSuccess={() => {
          setMessage("Booking created successfully!");
          setIsSuccess(true);
        }}
      />

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}

"use client";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { addToCartAction } from "@/actions/cart.actions";
import { cartActions, refreshCartCount } from "@/store";
import { LoginModal } from "./LoginModal";

export function PackageAddToCart({
  packageId,
  packageName,
  packageData,
  selectedPricingOption = null,
  showBookNow = true,
  showMessage = true,
  size = "md",
}) {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const router = useRouter();
  const cartCount = useSelector((state) => state.cart.count);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const pricingOptions = packageData?.pricingOptions || [];
  const requiresPricingSelection = pricingOptions.length > 0;

  const getPayload = () => {
    const payload = { packageId };
    if (!selectedPricingOption) return payload;

    const vehicleId = selectedPricingOption.vehicleId?._id || selectedPricingOption.vehicleId;
    const pricingOptions = selectedPricingOption._id || selectedPricingOption.pricingId;
    const selectedPax = Number(selectedPricingOption.pax || selectedPricingOption.selectedPax || 0) || 0;

    if (pricingOptions) payload.pricingOptions = pricingOptions;
    if (vehicleId) payload.vehicleId = vehicleId;
    if (selectedPax > 0) payload.selectedPax = selectedPax;
    return payload;
  };

  const handleAddToCart = async () => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsSuccess(false);

    try {
      const response = await addToCartAction(getPayload());
      
      if (response.ok) {
        const successText = `${packageName} added to cart!`;
        setMessage(successText);
        setIsSuccess(true);
        dispatch(cartActions.setCartCount((cartCount || 0) + 1));
        dispatch(refreshCartCount());
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("gh_cart_updated"));
        }
        showToast({ type: "success", message: successText });
      } else {
        const errorText = response.data?.message || response.data?.error || "Failed to add to cart";
        setMessage(errorText);
        setIsSuccess(false);
        showToast({ type: "error", message: errorText });
      }
    } catch (error) {
      const errorText = "Error adding to cart";
      setMessage(errorText);
      setIsSuccess(false);
      showToast({ type: "error", message: errorText });
    } finally {
      setLoading(false);
    }
  };

  const padClasses = size === "sm" ? "px-4 py-3 text-sm" : "px-5 py-4 text-base";

  return (
    <>
      <div className={showBookNow ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-3"}>
        <button
          onClick={handleAddToCart}
          disabled={loading}
          className={`inline-flex items-center justify-center rounded-2xl ${padClasses} font-black shadow-[0_14px_30px_rgba(16,185,129,0.35)] transition ${
            !user
              ? "bg-slate-200 text-slate-500"
              : isSuccess
                ? "bg-sky-500 text-white hover:bg-sky-600"
                : "bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60"
          }`}
        >
          {loading ? "Adding..." : isSuccess ? "✓ Added" : "🛒 Add to Cart"}
        </button>

        {showBookNow ? (
          <button
            onClick={async () => {
              if (!user) {
                setIsLoginOpen(true);
                return;
              }

              // if (requiresPricingSelection && !selectedPricingOption) {
              //   const messageText = "Please select a pricing option before booking.";
              //   setMessage(messageText);
              //   setIsSuccess(false);
              //   showToast({ type: "error", message: messageText });
              //   return;
              // }

              setLoading(true);
              try {
                await addToCartAction(getPayload());
                dispatch(refreshCartCount());
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new Event("gh_cart_updated"));
                }
              } finally {
                setLoading(false);
                router.push(`/booking?packageId=${encodeURIComponent(packageId)}`);
              }
            }}
            className={`inline-flex items-center justify-center rounded-2xl ${padClasses} font-black shadow-[0_14px_30px_rgba(14,165,233,0.35)] transition ${
              !user
                ? "bg-slate-200 text-slate-500"
                : "bg-sky-500 text-white hover:bg-sky-600"
            }`}
            type="button"
          >
            ✈️ Book Now
          </button>
        ) : null}
      </div>

      {showMessage && message && (
        <div className={`mt-3 rounded-2xl px-4 py-3 text-sm font-semibold text-center ${
          isSuccess
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-rose-50 text-rose-700 border border-rose-200"
        }`}>
          {message}
        </div>
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}

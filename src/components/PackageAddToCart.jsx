"use client";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { addToCartAction } from "@/actions/cart.actions";
import { cartActions, refreshCartCount } from "@/store";
import { LoginModal } from "./LoginModal";
import { Heart, CalendarCheck } from "lucide-react";

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

  const getPayload = () => {
    const userId = user?._id || user?.id;
    const payload = { packageId };

    if (userId) {
      payload.userId = userId;
      payload.user_id = userId;
    }
    if (!selectedPricingOption) return payload;

    const vehicleId = selectedPricingOption.vehicleId?._id || selectedPricingOption.vehicleId;
    const pricingId = selectedPricingOption._id || selectedPricingOption.pricingId;
    const selectedPax = Number(selectedPricingOption.pax || selectedPricingOption.selectedPax || 0) || 0;

    if (pricingId) payload.pricingId = pricingId;
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
    } catch {
      const errorText = "Error adding to cart";
      setMessage(errorText);
      setIsSuccess(false);
      showToast({ type: "error", message: errorText });
    } finally {
      setLoading(false);
    }
  };

  const padClasses = size === "sm" ? "px-4 py-3 text-sm" : "px-5 py-4 text-base";
  const isLoggedIn = Boolean(user);
  const addToCartDisabled = loading;
  const bookNowDisabled = loading;
  const addToCartClassName = !isLoggedIn
    ? "bg-slate-200 text-slate-500"
    : isSuccess
      ? "bg-[color:var(--gh-heading)] text-white hover:bg-[rgba(31,41,64,0.92)]"
      : "gh-secondary-btn disabled:opacity-60";
  const bookNowClassName = !isLoggedIn
    ? "bg-slate-200 text-slate-500"
    : "bg-[color:var(--gh-heading)] text-white hover:bg-[rgba(31,41,64,0.92)] disabled:opacity-60";

  return (
    <>
      <div className={showBookNow ? "flex gap-2 sm:gap-3" : "flex gap-3"}>
        <button
          onClick={handleAddToCart}
          disabled={addToCartDisabled}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-slate-200 bg-slate-100 py-2 sm:py-3 text-[10px] sm:text-[11px] font-black text-slate-700 transition hover:bg-rose-50 hover:border-rose-200 hover:text-gh-rose disabled:opacity-50`}
        >
          <Heart className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">{loading ? "Wait..." : isSuccess ? "Saved" : "Wishlist"}</span>
        </button>

        {showBookNow ? (
          <button
            onClick={async () => {
              if (!user) {
                setIsLoginOpen(true);
                return;
              }

              setLoading(true);
              try {
                const response = await addToCartAction(getPayload());
                if (response.ok) {
                  dispatch(refreshCartCount());
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("gh_cart_updated"));
                  }
                  router.push(`/booking?packageId=${encodeURIComponent(packageId)}`);
                } else {
                  const errorText = response.data?.message || response.data?.error || "Failed to add package for booking";
                  setMessage(errorText);
                  setIsSuccess(false);
                  showToast({ type: "error", message: errorText });
                }
              } finally {
                setLoading(false);
              }
            }}
            disabled={bookNowDisabled}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--gh-accent),var(--gh-accent-strong))] py-2 sm:py-3 text-[10px] sm:text-[11px] font-black text-white shadow-md shadow-rose-200 transition hover:scale-[1.02] disabled:opacity-50`}
            type="button"
          >
            <CalendarCheck className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">{loading ? "Wait..." : "Book Now"}</span>
          </button>
        ) : null}
      </div>

      {showMessage && message && (
        <div
          className={`mt-3 rounded-2xl px-4 py-3 text-center text-sm font-semibold ${
            isSuccess
              ? "border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] text-[color:var(--gh-heading)]"
              : "border border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {message}
        </div>
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}

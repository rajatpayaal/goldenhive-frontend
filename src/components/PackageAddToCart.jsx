"use client";
import React, { useEffect, useState } from "react";
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
  const [isHydrated, setIsHydrated] = useState(false);

  const pricingOptions = packageData?.pricingOptions || [];
  const requiresPricingSelection = pricingOptions.length > 0;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

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

    if (requiresPricingSelection && !selectedPricingOption) {
      const messageText = "Please select a pricing option before adding to cart.";
      setMessage(messageText);
      setIsSuccess(false);
      showToast({ type: "error", message: messageText });
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
  const selectionRequired = requiresPricingSelection && !selectedPricingOption;
  const canUseAuthState = isHydrated;
  const isLoggedIn = canUseAuthState && Boolean(user);
  const addToCartDisabled = !canUseAuthState || loading || selectionRequired;
  const addToCartClassName = !isLoggedIn
    ? "bg-slate-200 text-slate-500"
    : selectionRequired
      ? "bg-[color:var(--gh-bg-soft)] text-[color:var(--gh-accent)]"
      : isSuccess
        ? "bg-[color:var(--gh-heading)] text-white hover:bg-[rgba(31,41,64,0.92)]"
        : "bg-[linear-gradient(90deg,var(--gh-accent),var(--gh-accent-strong))] text-white disabled:opacity-60";
  const bookNowClassName = !isLoggedIn
    ? "bg-slate-200 text-slate-500"
    : "bg-[color:var(--gh-heading)] text-white hover:bg-[rgba(31,41,64,0.92)]";

  return (
    <>
      <div className={showBookNow ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-3"}>
        <button
          onClick={handleAddToCart}
          disabled={addToCartDisabled}
          className={`inline-flex items-center justify-center rounded-2xl ${padClasses} font-black shadow-[0_14px_30px_rgba(255,79,138,0.22)] transition ${addToCartClassName}`}
        >
          {!canUseAuthState
            ? "Add to Cart"
            : loading
            ? "Adding..."
            : selectionRequired
              ? "Select Pricing"
              : isSuccess
                ? "Added"
                : "Add to Cart"}
        </button>

        {showBookNow ? (
          <button
            onClick={async () => {
              if (!user) {
                setIsLoginOpen(true);
                return;
              }

              if (requiresPricingSelection && !selectedPricingOption) {
                const messageText = "Please select a pricing option before booking.";
                setMessage(messageText);
                setIsSuccess(false);
                showToast({ type: "error", message: messageText });
                return;
              }

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
            className={`inline-flex items-center justify-center rounded-2xl ${padClasses} font-black shadow-[0_14px_30px_rgba(255,79,138,0.22)] transition ${bookNowClassName}`}
            type="button"
          >
            Book Now
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

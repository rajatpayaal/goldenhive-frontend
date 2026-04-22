"use client";

import { useAuth } from "@/hooks/useAuth";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { getCartAction, removeFromCartAction } from "@/actions/cart.actions";
import { checkAuthTokenAction } from "@/actions/auth.check";
import { LoginModal } from "@/components/LoginModal";
import Link from "next/link";
import Loader from "@/components/Loader";

export default function CartClient() {
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  const normalizeEntry = (item) => (item?.packageId ? item : { packageId: item });
  const getEntryPackageId = (entry) => entry.packageId?._id || entry._id;
  const getSelectedPricingOption = (entry) => {
    const pkg = entry.packageId;
    if (!pkg) return null;

    // Prefer the pricing selection stored on the cart item.
    if (entry.selectedPricing) return entry.selectedPricing;

    // Legacy support: cart can store the selected pricing option id as `pricingId`.
    if (entry.pricingId && Array.isArray(pkg.pricingOptions)) {
      return pkg.pricingOptions.find((opt) => opt._id === entry.pricingId) || null;
    }

    // If nothing was selected, fall back to package base/final price (no pricing option).
    return null;
  };
  const getItemQuantity = (entry, selectedOption) =>
    Number(entry.selectedPax || selectedOption?.pax || 1) || 1;
  const getItemPrice = (entry, selectedOption) =>
    selectedOption?.finalPricePerPerson ?? entry.packageId?.basic?.finalPrice ?? 0;
  const getItemTotal = (entry, selectedOption, quantity) =>
    selectedOption?.totalPrice ?? getItemPrice(entry, selectedOption) * quantity;

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCartAction();
      if (response.ok) {
        const packages = response.data?.data?.cartItems || response.data?.data?.packageId || [];
        setCartItems(packages);
        setError("");
      } else {
        if (response.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError(response.data?.message || response.data?.error || "Failed to load cart.");
        }
        setCartItems([]);
      }
    } catch {
      setError("Failed to load cart. Please try again.");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

    fetchCart();
  }, [authLoading, user, hasToken, fetchCart]);

  useEffect(() => {
    const handleCartUpdate = () => {
      if (user || hasToken) {
        fetchCart();
      }
    };

    window.addEventListener("gh_cart_updated", handleCartUpdate);
    return () => window.removeEventListener("gh_cart_updated", handleCartUpdate);
  }, [user, hasToken, fetchCart]);

  const handleRemoveItem = async (packageId) => {
    try {
      const response = await removeFromCartAction(packageId);
      if (response.ok) {
        setCartItems((current) =>
          current.filter((item) => getEntryPackageId(normalizeEntry(item)) !== packageId)
        );
        setError("");
        showToast({ type: "success", message: "Item removed from cart." });
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("gh_cart_updated"));
        }
      } else {
        const errorText = response.data?.message || response.data?.error || "Failed to remove item.";
        setError(errorText);
        showToast({ type: "error", message: errorText });
      }
    } catch {
      const errorText = "Error removing item.";
      setError(errorText);
      showToast({ type: "error", message: errorText });
    }
  };

  if (authLoading || (loading && (user || hasToken))) {
    return <Loader message="Loading your cart..." />;
  }

  if (!user && !hasToken) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-20 text-center">
        <h1 className="text-3xl font-black text-slate-900">Shopping Cart</h1>
        <p className="mt-4 text-slate-600">Please log in to view your cart.</p>
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
      <div className="mx-auto px-5 py-20 text-center">
        <h1 className="text-3xl font-black text-slate-900">Shopping Cart</h1>
        <div className="mt-10 rounded-3xl border border-black/10 bg-slate-50 p-8">
          <p className="text-lg font-semibold text-slate-600">Your cart is empty.</p>
          <Link href="/" className="mt-6 inline-flex rounded-2xl bg-emerald-500 px-6 py-3 text-white font-bold hover:bg-emerald-600">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = cartItems.reduce((sum, item) => {
    const entry = normalizeEntry(item);
    const selectedOption = getSelectedPricingOption(entry);
    const quantity = getItemQuantity(entry, selectedOption);
    return sum + getItemTotal(entry, selectedOption, quantity);
  }, 0);

  return (
    <div className="mx-auto px-5 py-12">
      <h1 className="mb-8 text-3xl font-black text-slate-900">Shopping Cart</h1>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          {cartItems.map((item) => {
            const entry = normalizeEntry(item);
            const pkg = entry.packageId;
            const selectedOption = getSelectedPricingOption(entry);
            const quantity = getItemQuantity(entry, selectedOption);
            const pricePerPerson = getItemPrice(entry, selectedOption);
            const total = getItemTotal(entry, selectedOption, quantity);
            const productId = pkg?._id || entry._id;
            const removeId = pkg?._id || item._id;
            const vehicleLabel =
              selectedOption?.vehicleId?.name || selectedOption?.vehicleId || entry.vehicleId || "Not selected";
            const durationDays = pkg?.basic?.durationDays;
            const durationNights = pkg?.basic?.durationNights;
            const destination = pkg?.basic?.destination;

            return (
              <div key={productId} className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="relative h-32 w-full overflow-hidden rounded-2xl bg-slate-100 sm:h-28 sm:w-40">
                    {pkg?.images?.primary?.url ? (
                      <div
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${pkg.images.primary.url})` }}
                      />
                    ) : null}
                    {(durationDays || durationNights) && (
                      <div className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-xs font-black text-slate-900">
                        {durationDays ? `${durationDays}D` : ""}
                        {durationDays && durationNights ? " / " : ""}
                        {durationNights ? `${durationNights}N` : ""}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-lg font-black text-slate-900">
                          {pkg?.basic?.name || "Package"}
                        </h3>
                        <p className="mt-2 text-sm font-semibold text-slate-600">
                          {destination ? `${destination} • ` : ""}
                          {quantity} Traveller{quantity !== 1 ? "s" : ""}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(removeId)}
                        className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-600 hover:bg-rose-100"
                      >
                        Remove
                      </button>
                    </div>

                    {selectedOption ? (
                      <p className="mt-3 text-sm text-slate-600">
                        Vehicle: {vehicleLabel}
                      </p>
                    ) : pkg?.pricingOptions?.length > 0 ? (
                      <p className="mt-3 text-sm text-rose-600">
                        Please select a pricing option in package details.
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-black/5 pt-4">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Price per person
                        </div>
                        {selectedOption ? (
                          <>
                            {selectedOption.discountPercent > 0 && (
                              <div className="text-sm font-bold text-slate-400 line-through">
                                ₹{selectedOption.pricePerPerson?.toLocaleString("en-IN")}
                              </div>
                            )}
                            <div className="text-2xl font-black text-slate-900">
                              ₹{pricePerPerson?.toLocaleString("en-IN") || "TBA"}
                            </div>
                          </>
                        ) : (
                          <>
                            {pkg?.basic?.discount > 0 && (
                              <div className="text-sm font-bold text-slate-400 line-through">
                                {pkg.basic.basePrice?.toLocaleString("en-IN")}
                              </div>
                            )}
                            <div className="text-2xl font-black text-slate-900">
                              ₹{pkg?.basic?.finalPrice?.toLocaleString("en-IN") || "TBA"}
                            </div>
                          </>
                        )}
                        {selectedOption?.discountPercent > 0 && (
                          <div className="mt-1 text-xs font-bold text-emerald-600">
                            Save {selectedOption.discountPercent}%
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Total
                        </div>
                        <div className="mt-1 text-lg font-black text-slate-900">
                          ₹{total?.toLocaleString("en-IN")}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-slate-500">
                          Qty: {quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">Cart Summary</h2>

            <div className="mt-6 space-y-3 border-b border-black/5 pb-6">
              <div className="flex justify-between text-sm font-semibold text-slate-600">
                <span>Items:</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-slate-900">
                <span>Total:</span>
                <span>₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <p className="mb-6 mt-4 text-xs text-slate-500">
              Pricing options use group totals; otherwise prices are per person.
            </p>

            <div className="space-y-3">
              <Link
                href="/booking"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-4 text-base font-black text-white shadow-[0_14px_30px_rgba(16,185,129,0.35)] hover:bg-emerald-600"
              >
                Proceed to Booking
              </Link>
              <a
                href="https://wa.me/7505917525?text=I%20want%20to%20book%20these%20packages"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-500 px-5 py-4 text-base font-black text-white shadow-[0_14px_30px_rgba(14,165,233,0.35)] hover:bg-sky-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                Quick Inquiry via WhatsApp
              </a>
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-4 text-base font-black text-slate-900 hover:bg-slate-50"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

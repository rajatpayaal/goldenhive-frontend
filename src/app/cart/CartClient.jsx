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
    /* eslint-disable react-hooks/set-state-in-effect */
    if (authLoading) {
      return;
    }

    if (!user && !hasToken) {
      // User not logged in and no token - don't load cart
      return;
    }

    fetchCart();
    /* eslint-enable react-hooks/set-state-in-effect */
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
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5 sm:py-16">
        <div className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] px-5 py-10 text-center shadow-[0_20px_55px_rgba(121,68,44,0.12)] sm:px-8 sm:py-14">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">
            Your Cart
          </p>
          <h1 className="mt-3 text-3xl font-black text-[color:var(--gh-heading)] sm:text-4xl lg:text-5xl">Shopping Cart</h1>
          <p className="mt-4 text-[color:var(--gh-text-soft)]">Please log in to view your cart.</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIsLoginOpen(true)}
            className="inline-flex rounded-full bg-[linear-gradient(90deg,var(--gh-accent),var(--gh-accent-strong))] px-7 py-3 text-white font-bold shadow-[0_12px_30px_rgba(255,79,138,0.22)]"
          >
            Log In / Sign Up
          </button>
          <Link href="/" className="inline-flex rounded-full border border-[color:var(--gh-border)] bg-white px-6 py-3 font-bold text-[color:var(--gh-heading)]">
            Go Home
          </Link>
        </div>
        </div>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    );
  }

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-5 sm:py-16">
        <div className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] p-10 shadow-[0_20px_55px_rgba(121,68,44,0.12)]">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">
            Your Cart
          </p>
          <h1 className="mt-3 text-3xl font-black text-[color:var(--gh-heading)] sm:text-4xl lg:text-5xl">Shopping Cart</h1>
          <div className="mt-8 rounded-[1.5rem] border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] p-8">
            <p className="text-lg font-semibold text-[color:var(--gh-text-soft)]">Your cart is empty.</p>
          <Link href="/" className="mt-6 inline-flex rounded-full bg-[linear-gradient(90deg,var(--gh-accent),var(--gh-accent-strong))] px-7 py-3 text-white font-bold shadow-[0_12px_30px_rgba(255,79,138,0.22)]">
            Continue Shopping
          </Link>
          </div>
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

  const subtotal = totalPrice;
  const taxesAndFees = Math.round(totalPrice * 0.03);
  const grandTotal = subtotal + taxesAndFees;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-10">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">
          Your Cart ({cartItems.length} Items)
        </p>
        <h1 className="text-3xl font-black text-[color:var(--gh-heading)] sm:text-4xl lg:text-5xl">Review your journey</h1>
        <p className="max-w-2xl text-base font-medium text-[color:var(--gh-text-soft)]">
          A clean two-part checkout flow inspired by your reference: premium package cards on the left and a sticky payment summary on the right.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_380px]">
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
              <div key={productId} className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.98)] p-5 shadow-[0_18px_45px_rgba(121,68,44,0.12)] sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="relative h-36 w-full overflow-hidden rounded-[1.5rem] bg-[color:var(--gh-bg-soft)] sm:h-32 sm:w-44">
                    {pkg?.images?.primary?.url ? (
                      <div
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${pkg.images.primary.url})` }}
                      />
                    ) : null}
                    {(durationDays || durationNights) && (
                      <div className="absolute left-3 top-3 rounded-full bg-[linear-gradient(90deg,var(--gh-accent),var(--gh-accent-strong))] px-3 py-1.5 text-xs font-black text-white shadow-sm">
                        {durationDays ? `${durationDays}D` : ""}
                        {durationDays && durationNights ? " / " : ""}
                        {durationNights ? `${durationNights}N` : ""}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--gh-accent)]">
                          {destination || "Featured Package"}
                        </div>
                        <h3 className="mt-2 line-clamp-2 text-2xl font-black leading-[1.05] text-[color:var(--gh-heading)] sm:text-3xl">
                          {pkg?.basic?.name || "Package"}
                        </h3>
                        <p className="mt-2 text-sm font-semibold text-[color:var(--gh-text-soft)]">
                          {destination ? `${destination} • ` : ""}
                          {quantity} Traveller{quantity !== 1 ? "s" : ""}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(removeId)}
                        className="w-fit rounded-full border border-[color:var(--gh-border)] bg-white px-4 py-2 text-xs font-black text-[color:var(--gh-heading)]"
                      >
                        Remove
                      </button>
                    </div>

                    {selectedOption ? (
                      <p className="mt-3 text-sm text-[color:var(--gh-text-soft)]">
                        Vehicle: {vehicleLabel}
                      </p>
                    ) : pkg?.pricingOptions?.length > 0 ? (
                      <p className="mt-3 text-sm text-rose-600">
                        Please select a pricing option in package details.
                      </p>
                    ) : null}

                    <div className="mt-4 grid gap-4 border-t border-[color:var(--gh-border)] pt-4 sm:grid-cols-[1fr_auto] sm:items-end">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--gh-text-soft)]">
                          Price per person
                        </div>
                        {selectedOption ? (
                          <>
                            {selectedOption.discountPercent > 0 && (
                              <div className="text-sm font-bold text-[color:var(--gh-text-soft)] line-through">
                                ₹{selectedOption.pricePerPerson?.toLocaleString("en-IN")}
                              </div>
                            )}
                            <div className="text-2xl font-black text-[color:var(--gh-accent)] sm:text-3xl">
                              ₹{pricePerPerson?.toLocaleString("en-IN") || "TBA"}
                            </div>
                          </>
                        ) : (
                          <>
                            {pkg?.basic?.discount > 0 && (
                              <div className="text-sm font-bold text-[color:var(--gh-text-soft)] line-through">
                                {pkg.basic.basePrice?.toLocaleString("en-IN")}
                              </div>
                            )}
                            <div className="text-2xl font-black text-[color:var(--gh-accent)] sm:text-3xl">
                              ₹{pkg?.basic?.finalPrice?.toLocaleString("en-IN") || "TBA"}
                            </div>
                          </>
                        )}
                        {selectedOption?.discountPercent > 0 && (
                          <div className="mt-1 text-xs font-bold text-[color:var(--gh-accent)]">
                            Save {selectedOption.discountPercent}%
                          </div>
                        )}
                      </div>

                      <div className="rounded-[1.3rem] border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-5 py-4 text-right">
                        <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--gh-text-soft)]">
                          Total
                        </div>
                        <div className="mt-1 text-2xl font-black text-[color:var(--gh-heading)]">
                          ₹{total?.toLocaleString("en-IN")}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-[color:var(--gh-text-soft)]">
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
          <div className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.98)] p-6 shadow-[0_20px_55px_rgba(121,68,44,0.12)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.28em] text-[color:var(--gh-accent)]">
                  Mini Cart Summary
                </div>
                <h2 className="mt-2 text-3xl font-black text-[color:var(--gh-heading)]">My Cart</h2>
              </div>
              <div className="rounded-full bg-[linear-gradient(90deg,var(--gh-accent),var(--gh-accent-strong))] px-3 py-1.5 text-xs font-black text-white">
                {cartItems.length} items
              </div>
            </div>

            <div className="mt-6 space-y-4 border-b border-[color:var(--gh-border)] pb-6">
              <div className="flex justify-between text-sm font-semibold text-[color:var(--gh-text-soft)]">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[color:var(--gh-text-soft)]">
                <span>Taxes & Fees</span>
                <span>₹{taxesAndFees.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-[color:var(--gh-accent)]">
                <span>Total Amount</span>
                <span>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="rounded-[1.3rem] border border-dashed border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-4 text-sm font-semibold text-[color:var(--gh-accent)]">
                Add a coupon code
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {cartItems.slice(0, 3).map((item) => {
                const entry = normalizeEntry(item);
                const pkg = entry.packageId;
                const selectedOption = getSelectedPricingOption(entry);
                const quantity = getItemQuantity(entry, selectedOption);
                const total = getItemTotal(entry, selectedOption, quantity);
                return (
                  <div key={getEntryPackageId(entry)} className="flex items-center gap-3 rounded-[1.3rem] border border-[color:var(--gh-border)] bg-white px-3 py-3">
                    <div className="h-16 w-16 overflow-hidden rounded-2xl bg-[color:var(--gh-bg-soft)]">
                      {pkg?.images?.primary?.url ? (
                        <div
                          className="h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${pkg.images.primary.url})` }}
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-2 text-sm font-black text-[color:var(--gh-heading)]">
                        {pkg?.basic?.name || "Package"}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-[color:var(--gh-text-soft)]">
                        {quantity} traveller{quantity !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="text-sm font-black text-[color:var(--gh-accent)]">
                      ₹{total?.toLocaleString("en-IN")}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mb-6 mt-5 text-xs text-[color:var(--gh-text-soft)]">
              Pricing options use group totals; otherwise prices are per person.
            </p>

            <div className="space-y-3">
              <Link
                href="/booking"
                className="inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(90deg,var(--gh-accent),var(--gh-accent-strong))] px-5 py-4 text-base font-black text-white shadow-[0_14px_30px_rgba(255,79,138,0.22)]"
              >
                Proceed to Checkout -&gt;
              </Link>
              <a
                href="https://wa.me/7505917525?text=I%20want%20to%20book%20these%20packages"
                className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--gh-heading)] px-5 py-4 text-base font-black text-white shadow-[0_14px_30px_rgba(31,41,64,0.16)]"
                target="_blank"
                rel="noopener noreferrer"
              >
                Quick Inquiry on WhatsApp
              </a>
              <Link
                href="/packages"
                className="inline-flex w-full items-center justify-center rounded-full border border-[color:var(--gh-border)] bg-white px-5 py-4 text-base font-black text-[color:var(--gh-heading)]"
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

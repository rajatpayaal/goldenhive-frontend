"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import { decodeS3Url } from "@/lib/s3url";

import { getCartAction, removeFromCartAction } from "@/actions/cart.actions";
import { checkAuthTokenAction } from "@/actions/auth.check";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LoginModal } from "./LoginModal";

const formatCurrency = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return null;
  try {
    return new Intl.NumberFormat("en-IN").format(number);
  } catch {
    return String(number);
  }
};

const normalizeEntry = (item) => (item?.packageId ? item : { packageId: item });
const getEntryPackageId = (entry) => entry.packageId?._id || entry._id;

const getSelectedPricingOption = (entry) => {
  const pkg = entry.packageId;
  if (!pkg) return null;
  if (entry.selectedPricing) return entry.selectedPricing;
  if (entry.pricingId && Array.isArray(pkg.pricingOptions)) {
    return pkg.pricingOptions.find((opt) => opt._id === entry.pricingId) || null;
  }
  return null;
};

const getItemQuantity = (entry, selectedOption) =>
  Number(entry.selectedPax || selectedOption?.pax || 1) || 1;

const getItemTotal = (entry, selectedOption, quantity) =>
  selectedOption?.totalPrice ??
  (selectedOption?.finalPricePerPerson ?? entry.packageId?.basic?.finalPrice ?? 0) * quantity;

export function CartDropdown({ cartCount = 0, variant = "header-dark" }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const rootRef = useRef(null);
  const { user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const isDark = variant === "header-dark";

  const totals = useMemo(() => {
    const entries = items.map(normalizeEntry);
    const subtotal = entries.reduce((sum, entry) => {
      const selectedOption = getSelectedPricingOption(entry);
      const quantity = getItemQuantity(entry, selectedOption);
      return sum + getItemTotal(entry, selectedOption, quantity);
    }, 0);
    return { subtotal, entries };
  }, [items]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };

    const onMouseDown = (event) => {
      const root = rootRef.current;
      if (!root) return;
      if (!root.contains(event.target)) close();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [close, open]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const auth = await checkAuthTokenAction();
      if (!auth?.hasToken) {
        setItems([]);
        setError("Please log in to view your cart.");
        return;
      }

      const response = await getCartAction();
      if (!response?.ok) {
        setItems([]);
        setError("Failed to load cart.");
        return;
      }

      const packages =
        response?.data?.data?.cartItems || response?.data?.data?.packageId || [];
      setItems(Array.isArray(packages) ? packages : []);
    } catch {
      setItems([]);
      setError("Failed to load cart.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      if (open) refresh();
    };
    window.addEventListener("gh_cart_updated", handler);
    return () => window.removeEventListener("gh_cart_updated", handler);
  }, [open, refresh]);

  const onToggle = async () => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!open) return;
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [open, refresh]);

  const removeItem = async (packageId) => {
    if (!packageId) return;
    try {
      const response = await removeFromCartAction(packageId);
      if (!response?.ok) return;
      setItems((prev) =>
        prev.filter((item) => getEntryPackageId(normalizeEntry(item)) !== packageId)
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("gh_cart_updated"));
      }
    } catch {
      // best-effort
    }
  };

  return (
    <>
      <div ref={rootRef} className="relative">
        {/* Mobile: compact icon-only circle button */}
        <button
          type="button"
          onClick={onToggle}
          className={[
            "relative inline-flex items-center justify-center rounded-full transition",
            "sm:hidden",
            "h-9 w-9",
            isDark
              ? "bg-white/10 text-white hover:bg-white/15"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200",
          ].join(" ")}
          aria-label="Wishlist"
          aria-expanded={open}
        >
          <Heart className="h-5 w-5" aria-hidden="true" />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--gh-accent)] px-1 text-[10px] font-black text-white shadow-sm">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </button>

        {/* Desktop: pill button with text */}
        <button
          type="button"
          onClick={onToggle}
          className={[
            "relative hidden sm:inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm font-black transition",
            isDark
              ? "border-white/15 bg-white/10 text-white hover:bg-white/15"
              : "border-black/10 bg-white text-slate-900 hover:bg-slate-50",
          ].join(" ")}
          aria-label="Wishlist"
          aria-expanded={open}
        >
          <Heart className="h-5 w-5" aria-hidden="true" />
          <span>Wishlist</span>
          {cartCount > 0 && (
            <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gh-rose px-1.5 text-xs font-black text-white shadow-sm">
              {cartCount}
            </span>
          )}
        </button>

        {open && (
          <div
            className="fixed left-4 right-4 top-20 z-50 overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-[23rem] sm:max-w-[92vw] sm:origin-top-right sm:shadow-gh-soft"
            role="dialog"
            aria-label="Cart panel"
          >
            <div className="flex items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
              <div className="min-w-0">
                <div className="text-sm font-black text-slate-900">
                  Wishlist{" "}
                  <span className="text-xs font-semibold text-slate-500">
                    ({items.length} item{items.length !== 1 ? "s" : ""})
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  Subtotal:{" "}
                  <span className="font-black text-slate-900">
                    ₹{formatCurrency(totals.subtotal) || "0"}
                  </span>
                </div>
              </div>
              <Link
                href="/cart"
                onClick={close}
                className="text-xs font-black text-gh-plum hover:text-gh-plum2"
              >
                View Wishlist
              </Link>
            </div>

            <div className="max-h-[22rem] overflow-y-auto">
              {loading && (
                <div className="px-5 py-6 text-sm font-semibold text-slate-600">
                  Loading your plan...
                </div>
              )}

              {!loading && error && (
                <div className="px-5 py-6 text-sm font-semibold text-rose-700">{error}</div>
              )}

              {!loading && !error && totals.entries.length === 0 && (
                <div className="px-5 py-10 text-sm font-semibold text-slate-600">
                  Your plan is empty.
                </div>
              )}

              {!loading &&
                !error &&
                totals.entries.map((entry) => {
                  const pkg = entry.packageId;
                  const packageId = getEntryPackageId(entry);
                  const selectedOption = getSelectedPricingOption(entry);
                  const quantity = getItemQuantity(entry, selectedOption);
                  const total = getItemTotal(entry, selectedOption, quantity);
                  const imageUrl =
                    pkg?.images?.primary?.url || pkg?.images?.gallery?.[0]?.url || null;
                  const name = pkg?.basic?.name || "Package";
                  const destination = pkg?.basic?.destination;
                  const days = pkg?.basic?.durationDays;
                  const nights = pkg?.basic?.durationNights;
                  const href = `/packages/${pkg?.basic?.slug || packageId || ""}`;

                  return (
                    <div
                      key={packageId || href}
                      className="flex gap-3 border-b border-black/5 px-5 py-4 last:border-b-0"
                    >
                      <Link
                        href={href}
                        onClick={close}
                        className="h-16 w-16 overflow-hidden rounded-2xl border border-black/5 bg-slate-50"
                      >
                        {imageUrl ? (
                          <Image
                            src={decodeS3Url(imageUrl)}
                            alt={pkg?.images?.primary?.alt || name}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-black text-slate-400">
                            GH
                          </div>
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={href}
                          onClick={close}
                          className="line-clamp-2 text-sm font-black text-slate-900 hover:text-gh-plum2"
                        >
                          {name}
                        </Link>
                        <div className="mt-1 text-xs font-semibold text-slate-500">
                          {days || nights ? (
                            <>
                              {days ? `${days}D` : ""}
                              {days && nights ? " / " : ""}
                              {nights ? `${nights}N` : ""}
                              {" • "}
                            </>
                          ) : null}
                          {destination ? `${destination} • ` : ""}
                          {quantity} Traveller{quantity !== 1 ? "s" : ""}
                        </div>
                        <div className="mt-2 text-sm font-black text-gh-plum">
                          ₹{formatCurrency(total) || "TBA"}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(packageId)}
                        className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-2xl border border-black/10 bg-white text-slate-700 hover:bg-slate-50"
                        aria-label="Remove item"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
            </div>

            <div className="border-t border-black/5 bg-slate-50/50 p-5">
              <Button
                asChild
                variant="brand"
                className="w-full rounded-2xl py-3 text-sm font-black"
                onClick={close}
              >
                <Link href="/cart">Proceed to Checkout</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}

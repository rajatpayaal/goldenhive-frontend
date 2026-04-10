"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
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

    const fetchCart = async () => {
      setLoading(true);
      try {
        const response = await getCartAction();
        if (response.ok) {
          const packages = response.data?.data?.packageId || [];
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
    };

    fetchCart();
  }, [authLoading, user, hasToken]);

  const handleRemoveItem = async (packageId) => {
    try {
      const response = await removeFromCartAction(packageId);
      if (response.ok) {
        setCartItems((current) => current.filter((item) => item._id !== packageId));
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

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.basic?.finalPrice || 0), 0);

  return (
    <div className="mx-auto px-5 py-12">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Shopping Cart</h1>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item._id} className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                  {item.images?.primary?.url && (
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${item.images.primary.url})` }}
                    />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-black text-slate-900">{item.basic?.name}</h3>
                  <p className="mt-2 text-sm font-semibold text-slate-700">Slug: {item.basic?.slug}</p>
                </div>

                <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                  <div>
                    <div className="text-sm text-slate-500">Price per person</div>
                    {item.basic?.discount > 0 && (
                      <div className="text-sm font-bold text-slate-400 line-through">
                        {item.basic?.basePrice?.toLocaleString("en-IN")}
                      </div>
                    )}
                    <div className="text-2xl font-black text-slate-900">
                      {item.basic?.finalPrice?.toLocaleString("en-IN") || "TBA"}
                    </div>
                    {item.basic?.discount > 0 && (
                      <div className="text-xs font-bold text-emerald-600 mt-1">
                        Save {item.basic.discount}%
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item._id)}
                    className="rounded-lg bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-100 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-28 h-fit">
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">Cart Summary</h2>

            <div className="mt-6 space-y-3 border-b border-black/5 pb-6">
              <div className="flex justify-between text-sm font-semibold text-slate-600">
                <span>Items:</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-slate-900">
                <span>Total (per person):</span>
                <span>{totalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500 mb-6">
              💡 Prices shown are per person. Final booking amount may vary based on number of travelers and selected dates.
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


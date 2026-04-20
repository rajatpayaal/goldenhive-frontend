"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { useDispatch } from "react-redux";
import { getCartAction, removeFromCartAction } from "@/actions/cart.actions";
import { createBookingAction } from "@/actions/booking.actions";
import { checkAuthTokenAction } from "@/actions/auth.check";
import { cartActions } from "@/store";
import { LoginModal } from "@/components/LoginModal";
import Link from "next/link";
import Image from "next/image";
import Loader from "@/components/Loader";
import { useSearchParams } from "next/navigation";

export default function BookingPage() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const highlightedPackageId = searchParams?.get("packageId") || "";
  const { showToast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [packageTravellers, setPackageTravellers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // Booking form data
  const [bookingData, setBookingData] = useState({
    startDate: "",
    endDate: "",
    travellers: 1,
    note: "",
  });

  // Traveler details
  const [travelerDetails, setTravelerDetails] = useState([
    { name: "", age: "", email: "", phone: "" }
  ]);

  const normalizeEntry = (item) => (item?.packageId ? item : { packageId: item });
  const getEntryPackageId = (entry) => entry.packageId?._id || entry._id;
  const getSelectedPricingOption = (entry) => {
    const pkg = entry.packageId;
    if (!pkg) return null;

    // Cart API can send a fully populated selection as `selectedPricing`.
    if (entry.selectedPricing) return entry.selectedPricing;

    // Legacy support: cart can store the selected pricing option id as `pricingId`.
    if (entry.pricingId && Array.isArray(pkg.pricingOptions)) {
      return pkg.pricingOptions.find((opt) => opt._id === entry.pricingId) || null;
    }

    // If nothing was selected, booking should use package final price (no pricing option).
    return null;
  };
  const getItemQuantity = (entry, selectedOption) =>
    Number(entry.selectedPax || selectedOption?.pax || 1) || 1;
  const getItemPrice = (entry, selectedOption) =>
    selectedOption?.finalPricePerPerson ?? entry.packageId?.basic?.finalPrice ?? 0;
  const getItemTotal = (entry, selectedOption, quantity) =>
    selectedOption?.totalPrice ?? getItemPrice(entry, selectedOption) * quantity;

  const getEffectiveQuantity = (entry) => {
    const itemId = getEntryPackageId(entry);
    const selectedOption = getSelectedPricingOption(entry);

    // If a pricing option is selected, group size (pax) is fixed and should drive totals.
    if (selectedOption?.pax) return Math.max(1, Number(selectedOption.pax || 1));

    return Math.max(1, Number(packageTravellers[itemId] || 1));
  };

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
    if (authLoading) return;

    if (!user && !hasToken) {
      setLoading(false);
      return;
    }

    const fetchCart = async () => {
      setLoading(true);
      try {
        const response = await getCartAction();
        if (response.ok) {
          const packages = response.data?.data?.cartItems || response.data?.data?.packageId || [];
          const orderedPackages =
            highlightedPackageId && Array.isArray(packages) && packages.length > 1
              ? [
                  ...packages.filter((item) => getEntryPackageId(normalizeEntry(item)) === highlightedPackageId),
                  ...packages.filter((item) => getEntryPackageId(normalizeEntry(item)) !== highlightedPackageId),
                ]
              : packages;

          setCartItems(orderedPackages);
          setPackageTravellers(() => {
            const next = {};
            for (const item of orderedPackages) {
              const entry = normalizeEntry(item);
              const itemId = getEntryPackageId(entry);
              if (!itemId) continue;
              const selectedOption = getSelectedPricingOption(entry);
              next[itemId] = Number(item.selectedPax || selectedOption?.pax || 1) || 1;
            }
            return next;
          });
          const travelerCount = Math.max(
            1,
            ...orderedPackages.map((item) => {
              const entry = normalizeEntry(item);
              return Number(item.selectedPax || getSelectedPricingOption(entry)?.pax || 1) || 1;
            })
          );
          setBookingData(prev => ({ ...prev, travellers: travelerCount }));
          // Initialize traveler details based on number of packages/travelers
          setTravelerDetails(Array(travelerCount).fill().map(() => ({
            name: "", age: "", email: "", phone: ""
          })));
        } else {
          setError(response.data?.message || response.data?.error || "Failed to load cart.");
        }
      } catch {
        setError("Failed to load cart. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [authLoading, user, hasToken, highlightedPackageId]);

  const totalTravellers = (() => {
    const quantities = (cartItems || [])
      .map((item) => getEffectiveQuantity(normalizeEntry(item)))
      .filter((v) => Number.isFinite(v));
    return quantities.length > 0 ? Math.max(...quantities) : 1;
  })();

  useEffect(() => {
    if (cartItems.length === 0) return;
    const next = Math.max(1, totalTravellers || 1);
    if (bookingData.travellers !== next) {
      setBookingData((prev) => ({ ...prev, travellers: next }));
    }
  }, [cartItems.length, totalTravellers, bookingData.travellers]);

  // Ensure travelers count is always valid
  useEffect(() => {
    if (bookingData.travellers < 1 || isNaN(bookingData.travellers)) {
      setBookingData(prev => ({ ...prev, travellers: 1 }));
    }
  }, [bookingData.travellers]);

  // Ensure traveler details array matches travelers count
  useEffect(() => {
    const currentCount = travelerDetails.length;
    const targetCount = Math.max(1, bookingData.travellers);

    if (currentCount !== targetCount) {
      setTravelerDetails(prev => {
        const updated = [...prev];
        if (targetCount > currentCount) {
          // Add more travelers
          while (updated.length < targetCount) {
            updated.push({ name: "", age: "", email: "", phone: "" });
          }
        } else {
          // Remove travelers
          updated.splice(targetCount);
        }
        return updated;
      });
    }
  }, [bookingData.travellers, travelerDetails.length]);

  const handleBookingDataChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTravelerChange = (index, field, value) => {
    setTravelerDetails(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const validateForm = () => {
    if (!bookingData.startDate ) {
      setError("Please select check-in date.");
      return false;
    }

    // if (new Date(bookingData.startDate) >= new Date(bookingData.endDate)) {
    //   setError("Check-out date must be after check-in date.");
    //   return false;
    // }

    if (bookingData.travellers <= 0) {
      setError("Number of travelers must be at least 1.");
      return false;
    }

    // Validate traveler details
    for (let i = 0; i < bookingData.travellers; i++) {
      const traveler = travelerDetails[i];
      if (!traveler.name.trim()) {
        setError(`Please enter name for Traveler ${i + 1}.`);
        return false;
      }
      if (!traveler.age || traveler.age < 1 || traveler.age > 120) {
        setError(`Please enter valid age for Traveler ${i + 1}.`);
        return false;
      }
      if (!traveler.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(traveler.email)) {
        setError(`Please enter valid email for Traveler ${i + 1}.`);
        return false;
      }
      if (!traveler.phone.trim() || !/^[6-9]\d{9}$/.test(traveler.phone.replace(/\s+/g, ''))) {
        setError(`Please enter valid 10-digit phone number for Traveler ${i + 1}.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setError("");

    try {
      const totalAmount = cartItems.reduce((sum, item) => {
        const entry = normalizeEntry(item);
        const selectedOption = getSelectedPricingOption(entry);
        const quantity = getEffectiveQuantity(entry);
        return sum + getItemTotal(entry, selectedOption, quantity);
      }, 0);

      const packageItems = cartItems
        .filter((item) => {
          const entry = normalizeEntry(item);
          return Boolean(getEntryPackageId(entry));
        })
        .map((item) => {
          const entry = normalizeEntry(item);
          const itemId = getEntryPackageId(entry);
          const selectedOption = getSelectedPricingOption(entry);
          const quantity = getEffectiveQuantity(entry);
          const selectedPricing = entry.selectedPricing || null;
          return {
            packageId: itemId,
            travellers: quantity,
            travelerDetails: [],
            pricingId: selectedPricing?._id || entry.pricingId || selectedOption?._id,
            vehicleId:
              selectedPricing?.vehicleId?._id ||
              selectedPricing?.vehicleId ||
              entry.vehicleId ||
              selectedOption?.vehicleId?._id ||
              selectedOption?.vehicleId,
            selectedPax: quantity,
          };
        });

      const payload = {
        ...bookingData,
        packageId: cartItems.map(item => item._id),
        packageItems,
        travellers: Math.max(1, totalTravellers || 1),
        userId: user._id,
        totalAmount,
        travelerDetails,
      };

      const response = await createBookingAction(payload);

      if (response.ok) {
        const successText = "Your booking has been created successfully.";
        showToast({ type: "success", message: successText });
        setSuccess(true);
        setCartItems([]);

        if (cartItems.length > 0) {
          const removePromises = cartItems
            .filter((item) => item?._id)
            .map((item) => removeFromCartAction(item._id));

          const removeResults = await Promise.all(removePromises);
          const allRemoved = removeResults.every((result) => result?.ok);

          if (!allRemoved) {
            console.warn("Some cart items were not removed after booking:", removeResults);
          }

          dispatch(cartActions.clearCart());
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("gh_cart_updated"));
          }
        }
      } else {
        const errorText = response.data?.message || response.data?.error || "Failed to create booking";
        setError(errorText);
        showToast({ type: "error", message: errorText });
      }
    } catch (err) {
      const errorText = "Error creating booking. Please try again.";
      setError(errorText);
      showToast({ type: "error", message: errorText });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <Loader message="Loading booking details..." />;
  }

  if (!user && !hasToken) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-20 text-center">
        <h1 className="text-3xl font-black text-slate-900">Create Booking</h1>
        <p className="mt-4 text-slate-600">Please log in to create a booking.</p>
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
      <div className="mx-auto max-w-6xl px-5 py-20 text-center">
        <h1 className="text-3xl font-black text-slate-900">Create Booking</h1>
        <div className="mt-10 rounded-3xl border border-black/10 bg-slate-50 p-8">
          <p className="text-lg font-semibold text-slate-600">Your cart is empty.</p>
          <p className="mt-2 text-sm text-slate-500">Add packages to your cart before booking.</p>
          <Link href="/" className="mt-6 inline-flex rounded-2xl bg-emerald-500 px-6 py-3 text-white font-bold hover:bg-emerald-600">
            Browse Packages
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-20 text-center">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8">
          <div className="text-6xl text-emerald-600">✓</div>
          <h1 className="mt-4 text-3xl font-black text-slate-900">Booking Confirmed!</h1>
          <p className="mt-2 text-slate-600">
            Your booking has been created successfully. You will receive a confirmation email shortly.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/bookings"
              className="inline-flex rounded-2xl bg-emerald-500 px-6 py-3 text-white font-bold hover:bg-emerald-600"
            >
              View My Bookings
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-2xl border border-black/10 bg-white px-6 py-3 text-slate-900 font-bold hover:bg-slate-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cartSubtotal = cartItems.reduce((sum, item) => {
    const entry = normalizeEntry(item);
    const selectedOption = getSelectedPricingOption(entry);
    const quantity = getEffectiveQuantity(entry);
    return sum + getItemTotal(entry, selectedOption, quantity);
  }, 0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Create Booking</h1>

      <form onSubmit={handleSubmitBooking} className="grid gap-8 lg:grid-cols-3">
        {/* Package Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-black/10 bg-white p-6">
            <h2 className="text-xl font-black text-slate-900 mb-4">Selected Packages</h2>
            <div className="space-y-4">
              {cartItems.map((item) => {
                const entry = normalizeEntry(item);
                const pkg = entry.packageId;
                const itemId = getEntryPackageId(entry);
                const selectedOption = getSelectedPricingOption(entry);
                const quantity = getEffectiveQuantity(entry);
                const pricePerPerson = getItemPrice(entry, selectedOption);
                const subtotal = getItemTotal(entry, selectedOption, quantity);
                const vehicleLabel = selectedOption?.vehicleId?.name || selectedOption?.vehicleId || entry.vehicleId || "Not selected";

                return (
                  <div key={itemId} className="flex items-center gap-4 rounded-2xl border border-black/5 bg-slate-50 p-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                      {pkg?.images?.primary?.url && (
                        <Image
                          src={pkg.images.primary.url}
                          alt={pkg?.basic?.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{pkg?.basic?.name}</h3>
                      <p className="text-sm text-slate-600">
                        ₹{pricePerPerson?.toLocaleString("en-IN")} per traveller
                      </p>
                      {selectedOption ? (
                        <p className="mt-1 text-sm text-slate-600">
                          Option: {vehicleLabel} • {selectedOption.pax} Person{selectedOption.pax !== 1 ? "s" : ""}
                        </p>
                      ) : pkg?.pricingOptions?.length > 0 ? (
                        <p className="mt-1 text-sm text-rose-600">Please select a pricing option in package details.</p>
                      ) : null}
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        Subtotal: ₹{subtotal.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">Travellers</label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        disabled={Boolean(selectedOption?.pax)}
                        onChange={(e) => {
                          const value = Math.max(1, parseInt(e.target.value, 10) || 1);
                          setPackageTravellers((prev) => ({ ...prev, [itemId]: value }));
                        }}
                        className="h-10 w-24 rounded-xl border border-black/10 bg-white px-3 text-sm font-black text-slate-900 outline-none focus:border-emerald-500 disabled:opacity-60 disabled:bg-slate-100"
                        aria-label={`Travellers for ${pkg?.basic?.name || "package"}`}
                        required
                      />
                      {selectedOption?.pax ? (
                        <p className="text-[11px] font-semibold text-slate-500">
                          Group size fixed by selected pricing.
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Traveler Details */}
          <div className="rounded-3xl border border-black/10 bg-white p-6">
            <h2 className="text-xl font-black text-slate-900 mb-4">Traveler Details</h2>
            <div className="space-y-6">
              {travelerDetails.map((traveler, index) => (
                <div key={index} className="rounded-2xl border border-black/5 bg-slate-50 p-4">
                  <h3 className="font-bold text-slate-900 mb-3">Traveler {index + 1}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={traveler.name}
                        onChange={(e) => handleTravelerChange(index, 'name', e.target.value)}
                        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Age *</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={traveler.age}
                        onChange={(e) => handleTravelerChange(index, 'age', e.target.value)}
                        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                        placeholder="Enter age"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={traveler.email}
                        onChange={(e) => handleTravelerChange(index, 'email', e.target.value)}
                        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        value={traveler.phone}
                        onChange={(e) => handleTravelerChange(index, 'phone', e.target.value)}
                        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                        placeholder="Enter 10-digit phone number"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-black/10 bg-white p-6 lg:sticky lg:top-28">
            <h2 className="text-xl font-black text-slate-900 mb-4">Booking Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Check-in Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={bookingData.startDate}
                  onChange={handleBookingDataChange}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Check-out Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={bookingData.endDate}
                  onChange={handleBookingDataChange}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  required
                />
              </div> */}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Number of Travelers *</label>
                <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-3 py-2">
                  <span className="text-sm font-semibold text-slate-600">Total (max)</span>
                  <span className="text-sm font-black text-slate-900">{Math.max(1, totalTravellers || 1)}</span>
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-500">
                  Update travellers per package in the list on the left.
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Special Requests</label>
                <textarea
                  name="note"
                  value={bookingData.note}
                  onChange={handleBookingDataChange}
                  placeholder="Any special requests..."
                  rows="3"
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {error}
              </div>
            )}

            <div className="mt-6 border-t border-black/5 pt-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                  <span>Subtotal:</span>
                  <span>₹{cartSubtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-black text-slate-900">
                  <span>Total Amount:</span>
                  <span>₹{cartSubtotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-white hover:bg-emerald-600 disabled:opacity-60"
              >
                {submitting ? "Creating Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

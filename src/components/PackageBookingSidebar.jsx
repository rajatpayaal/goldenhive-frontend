"use client";

import React from "react";
import { CalendarDays, MessageCircle, Phone, ShieldCheck, Star, Users } from "lucide-react";

import { PackageAddToCart } from "./PackageAddToCart";

function formatInr(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return "TBA";
  return numeric.toLocaleString("en-IN");
}

function normalizeGroupSize(selectedOption, bestDeal, pricingOptions) {
  const pax = selectedOption?.pax;
  return pax ? `4 to ${Math.max(4, Number(pax))}` : null;
}

export function PackageBookingSidebar({
  packageId,
  packageName,
  packageData,
  bestDeal,
  pricing,
  whatsapp,
  callNumber,
  cancellationPolicy,
  refundPolicy,
  availability,
  pricingOptions,
  selectedOption,
  onOptionSelect,
}) {
  const finalPrice =
    selectedOption?.finalPricePerPerson ??
    pricing?.finalPrice ??
    packageData?.basic?.finalPrice;
  const basePrice = selectedOption?.pricePerPerson ?? pricing?.basePrice ?? packageData?.basic?.basePrice ?? null;
  const durationLabel = `${packageData?.basic?.durationDays ?? "-"}D / ${packageData?.basic?.nights ?? "-"}N`;
  const groupSize =
    normalizeGroupSize(selectedOption, bestDeal, pricingOptions) ??
    packageData?.quickInfo?.groupSize ??
    "Small groups";
  const seatsLeft = availability?.seatsLeft ?? packageData?.availability?.seatsLeft ?? 5;
  const reviewCount = packageData?.reviews?.length ?? 120;
  const trustCount = packageData?.meta?.status === "ACTIVE" ? "Trusted by 50K+ travelers" : "Verified package support";
  const clearSelectedOption = () => {
    onOptionSelect?.(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("pricing-option-selected", { detail: null })
      );
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.98)] p-6 shadow-[0_22px_60px_rgba(121,68,44,0.14)]">
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,79,138,0.16),transparent_68%)]" />
      <div className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(255,185,94,0.18),transparent_70%)]" />

      <div className="relative">
        <div className="flex justify-between items-start">
          <div className="inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-black text-gh-rose uppercase tracking-widest">
            Special Offer
          </div>
        </div>

        <div className="mt-2 flex items-start justify-between">
          <h2 className="text-xl font-bold leading-tight text-slate-800 max-w-[60%]">
            {packageName}
          </h2>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-semibold text-slate-500">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-gh-rose">Rs.{formatInr(finalPrice)}</span>
              <span className="text-[10px] font-semibold text-slate-500">/person</span>
            </div>
            {basePrice && Number(basePrice) > Number(finalPrice) ? (
              <div className="flex items-center gap-2 mt-1">
                <span className="rounded-full bg-gh-rose px-2 py-0.5 text-[9px] font-bold text-white">
                  {Math.round(((basePrice - finalPrice) / basePrice) * 100)}% OFF
                </span>
                <span className="text-[10px] font-bold text-slate-400 line-through">
                  Rs.{formatInr(basePrice)}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-y border-black/5 py-3 text-[11px] font-semibold text-slate-700">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-gh-rose" />
            <span>{durationLabel}</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-black/5 pl-3">
            <ShieldCheck className="h-3.5 w-3.5 text-gh-rose" />
            <span>{packageData?.basic?.destination || "Ex- Haridwar"}</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-black/5 pl-3">
            <Users className="h-3.5 w-3.5 text-gh-rose" />
            <span>{groupSize}</span>
          </div>
        </div>

        {selectedOption ? (
          <div className="mt-4 rounded-[1.6rem] border border-[color:var(--gh-border)] bg-[linear-gradient(135deg,rgba(255,79,138,0.08),rgba(255,185,94,0.12))] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--gh-accent)]">
                  Selected Option
                </div>
                <div className="mt-1 text-sm font-black text-[color:var(--gh-heading)]">
                  {selectedOption.vehicleId?.name} for {selectedOption.pax} guests
                </div>
              </div>
              <button
                type="button"
                onClick={clearSelectedOption}
                className="rounded-full border border-[color:var(--gh-border)] bg-white px-3 py-1 text-xs font-black text-[color:var(--gh-heading)]"
              >
                Clear
              </button>
            </div>
            <div className="mt-3 text-sm font-semibold text-[color:var(--gh-text-soft)]">
              Total trip price: <span className="font-black text-[color:var(--gh-heading)]">Rs.{formatInr(selectedOption.totalPrice)}</span>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex gap-3">
          <button className="flex-1 rounded-xl border-2 border-slate-200 bg-slate-100 py-3 text-[11px] font-black text-slate-700 transition hover:bg-slate-200">
            View Itinerary
          </button>
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-xl bg-emerald-600 py-3 text-center text-[11px] font-black text-white shadow-md transition hover:bg-emerald-700"
          >
            Enquire Now
          </a>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-orange-50/50 px-4 py-3 border border-orange-100">
          <ShieldCheck className="h-5 w-5 text-gh-rose shrink-0" />
          <div>
            <div className="text-[11px] font-bold text-slate-800">Secure Booking</div>
            <div className="text-[9px] font-semibold text-slate-500 mt-0.5">
              100% secure payments • Easy cancellation • 24x7 support
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

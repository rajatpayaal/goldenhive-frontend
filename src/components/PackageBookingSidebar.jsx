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
  const pax =
    selectedOption?.pax ||
    bestDeal?.pax ||
    pricingOptions?.find((option) => option?.isBestDeal)?.pax ||
    pricingOptions?.[0]?.pax;
  return pax ? `4 to ${Math.max(4, Number(pax))}` : "Small groups";
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
    bestDeal?.finalPricePerPerson ??
    pricing?.finalPrice ??
    packageData?.basic?.finalPrice;
  const basePrice =
    selectedOption?.pricePerPerson ?? bestDeal?.pricePerPerson ?? pricing?.basePrice ?? null;
  const durationLabel = `${packageData?.basic?.durationDays ?? "-"}D / ${packageData?.basic?.nights ?? "-"}N`;
  const groupSize = normalizeGroupSize(selectedOption, bestDeal, pricingOptions);
  const seatsLeft = availability?.seatsLeft ?? packageData?.availability?.seatsLeft ?? 5;
  const reviewCount = packageData?.reviews?.length ?? 120;
  const trustCount = packageData?.meta?.status === "ACTIVE" ? "Trusted by 50K+ travelers" : "Verified package support";

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.98)] p-6 shadow-[0_22px_60px_rgba(121,68,44,0.14)]">
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,79,138,0.16),transparent_68%)]" />
      <div className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(255,185,94,0.18),transparent_70%)]" />

      <div className="relative">
        <div className="inline-flex rounded-full bg-[rgba(255,79,138,0.12)] px-3 py-1 text-xs font-black text-[color:var(--gh-accent)]">
          Only {seatsLeft} seats left
        </div>

        <h2 className="mt-4 text-[1.8rem] font-black leading-tight text-[color:var(--gh-heading)]">
          {packageName}
        </h2>

        <div className="mt-5 rounded-[1.6rem] border border-[color:var(--gh-border)] bg-white p-5 shadow-[0_12px_30px_rgba(121,68,44,0.06)]">
          {basePrice && Number(basePrice) > Number(finalPrice) ? (
            <div className="text-sm font-bold text-[color:var(--gh-text-soft)] line-through">
              Rs.{formatInr(basePrice)}
            </div>
          ) : null}
          <div className="mt-1 flex items-end gap-2">
            <div className="text-5xl font-black tracking-tight text-[color:var(--gh-accent)]">
              Rs.{formatInr(finalPrice)}
            </div>
            <div className="pb-2 text-sm font-semibold text-[color:var(--gh-text-soft)]">/ person</div>
          </div>
          <p className="mt-2 text-sm font-semibold text-[color:var(--gh-text-soft)]">
            {pricing?.taxesIncluded ? "Inclusive of all taxes" : "Taxes calculated at checkout"}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-4">
              <div className="flex items-center gap-2 text-[color:var(--gh-accent)]">
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-[0.22em]">Duration</span>
              </div>
              <div className="mt-3 text-sm font-black text-[color:var(--gh-heading)]">{durationLabel}</div>
            </div>
            <div className="rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-4">
              <div className="flex items-center gap-2 text-[color:var(--gh-accent)]">
                <Users className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-[0.22em]">Group Size</span>
              </div>
              <div className="mt-3 text-sm font-black text-[color:var(--gh-heading)]">{groupSize}</div>
            </div>
          </div>

          <div className="mt-5 space-y-2 text-sm font-semibold text-[color:var(--gh-text-soft)]">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-[color:var(--gh-accent-strong)] text-[color:var(--gh-accent-strong)]" />
              <span className="font-black text-[color:var(--gh-accent)]">4.8</span>
              <span>({reviewCount} Reviews)</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[color:var(--gh-accent)]" />
              <span>{trustCount}</span>
            </div>
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
                onClick={() => onOptionSelect(null)}
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

        <div className="mt-5">
          <PackageAddToCart
            packageId={packageId}
            packageName={packageName}
            packageData={packageData}
            selectedPricingOption={selectedOption}
          />
        </div>

        <div className="mt-3 grid gap-3">
          <a
            href={`https://wa.me/${whatsapp}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#16a34a] px-5 py-4 text-base font-black text-white shadow-[0_14px_30px_rgba(22,163,74,0.22)] transition hover:-translate-y-0.5 hover:bg-[#15803d]"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>
          <a
            href={`tel:${callNumber}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--gh-border)] bg-white px-5 py-4 text-base font-black text-[color:var(--gh-heading)] transition hover:bg-[color:var(--gh-bg-soft)]"
          >
            <Phone className="h-4 w-4" />
            Call Now
          </a>
        </div>

        <div className="mt-5 space-y-2 rounded-[1.4rem] border border-dashed border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-4 text-sm font-semibold text-[color:var(--gh-text-soft)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[color:var(--gh-accent)]" />
            <span>Secure Booking</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-[color:var(--gh-accent)]" />
            <span>Best Price Guarantee</span>
          </div>
          {cancellationPolicy ? (
            <div className="pt-2 text-xs leading-5">{cancellationPolicy}</div>
          ) : null}
          {refundPolicy ? <div className="text-xs leading-5">{refundPolicy}</div> : null}
        </div>
      </div>
    </div>
  );
}

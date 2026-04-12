"use client";

import React from "react";
import { PackageAddToCart } from "./PackageAddToCart";

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
  return (
    <aside className="lg:sticky lg:top-28 h-fit">
      <div className="rounded-3xl border border-black/5 bg-white p-7 shadow-2xl overflow-hidden">
        {/* Premium Header Background */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-emerald-400/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-sky-500/10 to-sky-400/5 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-600">
                📦 Book This Package
              </div>
              <div className="mt-2 text-xl font-black text-slate-900 line-clamp-2">
                {packageName}
              </div>
            </div>
            {((selectedOption?.discountPercent || pricing?.discountPercent) > 0) && (
              <div className="rounded-full bg-gradient-to-r from-emerald-500/15 to-emerald-400/10 px-4 py-2 text-sm font-black text-emerald-700 border border-emerald-200 whitespace-nowrap">
                💰 Save {selectedOption?.discountPercent || pricing?.discountPercent}%
              </div>
            )}
          </div>

          {/* Selected Option / Best Deal Section */}
          {selectedOption && (
            <div className="mt-6 rounded-2xl border-2 border-gradient-to-br from-orange-200 to-orange-100 bg-gradient-to-br from-orange-50/80 to-orange-50/30 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl animate-pulse">⭐</span>
                <span className="text-sm font-black uppercase tracking-widest text-orange-800">
                  {selectedOption.isBestDeal ? "⭐ Best Deal Selected" : "✓ Selected Option"}
                </span>
              </div>
              
              <div className="bg-white rounded-xl p-4 space-y-3 border border-orange-100">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  🚗 {selectedOption.vehicleId?.name} • {selectedOption.pax} Person{selectedOption.pax !== 1 ? "s" : ""}
                </div>
                
                <div className="flex flex-wrap items-end gap-2">
                  {selectedOption.discountPercent > 0 && (
                    <div className="text-sm font-bold text-slate-400 line-through">
                      ₹{selectedOption.pricePerPerson?.toLocaleString("en-IN")}
                    </div>
                  )}
                  <div className="text-4xl font-black tracking-tight text-slate-900">
                    ₹{selectedOption.finalPricePerPerson?.toLocaleString("en-IN")}
                  </div>
                  <div className="pb-1 text-sm font-bold text-slate-600">/person</div>
                </div>
                
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs font-black">
                  <span className="text-slate-700">Total ({selectedOption.pax} guests):</span>
                  <span className="text-slate-900 text-lg">₹{selectedOption.totalPrice?.toLocaleString("en-IN")}</span>
                </div>
              </div>
              
              {selectedOption.discountPercent > 0 && (
                <div className="mt-3 rounded-lg bg-gradient-to-r from-emerald-400/20 to-emerald-300/10 px-4 py-2.5 text-center border border-emerald-200/50">
                  <p className="text-xs font-black text-emerald-700">
                    🎉 You Save ₹{(selectedOption.pricePerPerson - selectedOption.finalPricePerPerson)?.toLocaleString("en-IN")} per person
                  </p>
                </div>
              )}
            </div>
          )}

          {!selectedOption && (
            <div className="mt-6 rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/50 p-5">
              <div className="flex flex-wrap items-end gap-3">
                {pricing?.basePrice > 0 && pricing.discountPercent > 0 && (
                  <div className="text-sm font-bold text-slate-400 line-through">
                    ₹{pricing.basePrice}
                  </div>
                )}
                <div className="text-4xl font-black tracking-tight text-slate-900">
                  ₹{pricing?.finalPrice || "TBA"}
                </div>
                <div className="pb-1 text-sm font-bold text-slate-600">/person</div>
              </div>
              <div className="mt-3 text-xs font-semibold text-slate-600">
                {pricing?.taxesIncluded ? "✓ Includes all taxes" : "Taxes not included"}
              </div>
            </div>
          )}

          {availability?.seatsLeft > 0 && (
            <div className="mt-5 rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50 px-5 py-4 text-sm font-bold text-amber-800 flex items-center gap-2">
              <span className="text-lg">⚡</span>
              Only {availability.seatsLeft} seats left
            </div>
          )}

          <div className="mt-7 grid gap-3">
            <PackageAddToCart 
              packageId={packageId} 
              packageName={packageName}
              packageData={{
                ...packageData,
                selectedPricingOption: selectedOption,
              }}
            />
            <a
              href={`https://wa.me/${whatsapp}`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-4 text-base font-black text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              target="_blank"
              rel="noopener noreferrer"
            >
              💬 Chat on WhatsApp
            </a>
            <a
              href={`tel:${callNumber}`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 bg-white px-5 py-4 text-base font-black text-slate-900 hover:bg-slate-50 hover:border-slate-400 transition-all"
            >
              ☎️ Call Now
            </a>
          </div>

          {(cancellationPolicy || refundPolicy) && (
            <div className="mt-7 space-y-2 border-t-2 border-slate-200 pt-5 text-sm font-semibold text-slate-700">
              {cancellationPolicy && <p>✅ {cancellationPolicy}</p>}
              {refundPolicy && <p>💳 {refundPolicy}</p>}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

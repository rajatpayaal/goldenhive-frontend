"use client";

import React, { useState } from "react";
import { PackageAddToCart } from "./PackageAddToCart";

const formatInr = (value) => {
  const numeric = typeof value === "string" && value.trim() === "" ? NaN : Number(value);
  if (Number.isFinite(numeric)) {
    return numeric.toLocaleString("en-IN");
  }
  return value ?? "TBA";
};

export function PricingOptionsSelector({ 
  packageId, 
  packageName, 
  pricingOptions, 
  onOptionSelect, 
  selectedOption: initialSelected 
}) {
  const [selectedOption, setSelectedOption] = useState(
    initialSelected || null
  );

  const handleSelectOption = (option) => {
    if (selectedOption && selectedOption._id === option._id) {
      // Deselect if already selected
      setSelectedOption(null);
      if (onOptionSelect) {
        onOptionSelect(null);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("pricing-option-selected", { detail: null })
        );
      }
    } else {
      // Select new option
      setSelectedOption(option);
      if (onOptionSelect) {
        onOptionSelect(option);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("pricing-option-selected", { detail: option })
        );
      }
    }
  };

  if (!pricingOptions || pricingOptions.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Select Group Size & Vehicle
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Choose the best option for your group
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pricingOptions.map((option) => {
          const vehicle = option.vehicleId;
          const isBestDeal = option.isBestDeal;
          const isSelected = selectedOption?._id === option._id;

          return (
            <div
              key={option._id}
              onClick={() => handleSelectOption(option)}
              className={`relative cursor-pointer overflow-hidden rounded-3xl border-2 transition-all duration-200 ${
                isSelected
                  ? "border-sky-500 bg-sky-50 shadow-[0_12px_30px_rgba(14,165,233,0.15)]"
                  : "border-black/5 bg-white hover:border-black/10 hover:shadow-md"
              }`}
            >
              {/* Best Deal Badge */}
              {isBestDeal && (
                <div className="absolute -right-2 -top-2 z-10">
                  <div className="flex items-center gap-1.5 rounded-bl-3xl bg-gradient-to-br from-orange-400 to-orange-500 px-4 py-3 text-white shadow-2xl border border-orange-300/50">
                    <span className="text-xl">⭐</span>
                    <span className="text-xs font-black uppercase tracking-widest">Best Deal</span>
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Vehicle Image - Enhanced */}
                {vehicle?.image?.url && (
                  <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100 mb-4 border border-black/5 group-hover:shadow-lg transition-shadow">
                    <img
                      src={vehicle.image.url}
                      alt={vehicle.image.alt || vehicle.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {vehicle?.type && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
                        <p className="text-xs font-bold text-white/90">{vehicle.type}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Pax Count - Enhanced */}
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-50 px-4 py-2 mb-4 border border-emerald-200">
                  <span className="text-lg">👥</span>
                  <span className="text-sm font-black text-emerald-900">
                    {option.pax} Person{option.pax !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Vehicle Info - Enhanced */}
                <div className="mb-4">
                  <h3 className="text-lg font-black text-slate-900 capitalize">
                    {vehicle?.name || "Vehicle"}
                  </h3>
                  {vehicle?.seat && (
                    <p className="text-xs font-bold text-slate-600 mt-1">
                      Capacity: {vehicle.seat} seats
                    </p>
                  )}
                </div>

                {/* Pricing - Premium Card */}
                <div className="space-y-2 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 p-5 mb-4 border border-black/5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Price Per Person
                    </span>
                    {option.discountPercent > 0 && (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-black text-emerald-700">
                        {option.discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  <div className="flex items-end gap-2">
                    {option.discountPercent > 0 && (
                      <div className="text-sm font-bold text-slate-400 line-through">
                        ₹{formatInr(option.pricePerPerson)}
                      </div>
                    )}
                    <div className="text-3xl font-black tracking-tight text-slate-900">
                      ₹{formatInr(option.finalPricePerPerson)}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-black/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">
                      Total ({option.pax} pax):
                    </span>
                    <span className="font-black text-slate-900 text-lg">
                      ₹{formatInr(option.totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Discount Badge */}
                {option.discountPercent > 0 && (
                  <div className="mb-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-4 py-3 text-center border border-emerald-200">
                    <p className="text-xs font-black text-emerald-700">
                      💰 Save ₹{formatInr(option.pricePerPerson - option.finalPricePerPerson)} per person
                    </p>
                  </div>
                )}

                {/* Premium Selection Button */}
                <button
                  onClick={() => handleSelectOption(option)}
                  className={`w-full flex items-center justify-center h-12 rounded-xl font-extrabold transition-all duration-200 border-2 ${
                    isSelected
                      ? 'bg-gradient-to-r from-rose-500 to-rose-600 border-rose-600 text-white shadow-lg hover:shadow-xl'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-sky-400 hover:bg-sky-50'
                  }`}
                >
                  {isSelected ? '✕ Deselect' : 'Select This Option'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}

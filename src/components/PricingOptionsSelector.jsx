"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

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
  selectedOption,
}) {
  const [localSelectedOption, setLocalSelectedOption] = useState(null);
  const isControlled = typeof selectedOption !== "undefined";
  const currentSelectedOption = isControlled ? selectedOption : localSelectedOption;

  useEffect(() => {
    if (isControlled || typeof window === "undefined") return;

    const handlePricingSelect = (event) => {
      setLocalSelectedOption(event.detail || null);
    };

    window.addEventListener("pricing-option-selected", handlePricingSelect);
    return () => window.removeEventListener("pricing-option-selected", handlePricingSelect);
  }, [isControlled]);

  const handleSelectOption = (option) => {
    const nextOption = currentSelectedOption?._id === option._id ? null : option;

    if (!isControlled) {
      setLocalSelectedOption(nextOption);
    }

    onOptionSelect?.(nextOption);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("pricing-option-selected", { detail: nextOption })
      );
    }
  };

  if (!pricingOptions || pricingOptions.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Select Group Size and Vehicle
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
          const isSelected = currentSelectedOption?._id === option._id;

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
              {isBestDeal && (
                <div className="absolute -right-2 -top-2 z-10">
                  <div className="rounded-bl-3xl border border-orange-300/50 bg-gradient-to-br from-orange-400 to-orange-500 px-4 py-3 text-white shadow-2xl">
                    <span className="text-xs font-black uppercase tracking-widest">Best Deal</span>
                  </div>
                </div>
              )}

              <div className="p-6">
                {vehicle?.image?.url && (
                  <div className="relative mb-4 h-40 w-full overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-br from-slate-200 to-slate-100 transition-shadow group-hover:shadow-lg">
                    <Image
                      src={vehicle.image.url}
                      alt={vehicle.image.alt || vehicle.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {vehicle?.type && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
                        <p className="text-xs font-bold text-white/90">{vehicle.type}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mb-4 inline-flex items-center rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-100 to-emerald-50 px-4 py-2">
                  <span className="text-sm font-black text-emerald-900">
                    {option.pax} Person{option.pax !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-black capitalize text-slate-900">
                    {vehicle?.name || "Vehicle"}
                  </h3>
                  {vehicle?.seat && (
                    <p className="mt-1 text-xs font-bold text-slate-600">
                      Capacity: {vehicle.seat} seats
                    </p>
                  )}
                </div>

                <div className="mb-4 space-y-2 rounded-2xl border border-black/5 bg-gradient-to-br from-slate-50 to-slate-100/50 p-5">
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
                        Rs.{formatInr(option.pricePerPerson)}
                      </div>
                    )}
                    <div className="text-3xl font-black tracking-tight text-slate-900">
                      Rs.{formatInr(option.finalPricePerPerson)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-black/10 pt-3">
                    <span className="text-xs font-bold text-slate-600">
                      Total ({option.pax} pax):
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      Rs.{formatInr(option.totalPrice)}
                    </span>
                  </div>
                </div>

                {option.discountPercent > 0 && (
                  <div className="mb-4 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-4 py-3 text-center">
                    <p className="text-xs font-black text-emerald-700">
                      Save Rs.{formatInr(option.pricePerPerson - option.finalPricePerPerson)} per person
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleSelectOption(option);
                  }}
                  className={`flex h-12 w-full items-center justify-center rounded-xl border-2 font-extrabold transition-all duration-200 ${
                    isSelected
                      ? "border-rose-600 bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg hover:shadow-xl"
                      : "border-slate-200 bg-white text-slate-700 hover:border-sky-400 hover:bg-sky-50"
                  }`}
                >
                  {isSelected ? "Remove Selection" : "Select This Option"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

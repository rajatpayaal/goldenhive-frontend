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
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-black tracking-tight text-slate-800">
          Vehicle Options
        </h2>
        <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
          Choose your preferred vehicle
        </p>
      </div>

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 no-scrollbar">
        {pricingOptions.map((option) => {
          const vehicle = option.vehicleId;
          const isBestDeal = option.isBestDeal;
          const isSelected = currentSelectedOption?._id === option._id;

          return (
            <div
              key={option._id}
              onClick={() => handleSelectOption(option)}
              className={`relative shrink-0 snap-start w-[160px] cursor-pointer overflow-hidden rounded-2xl border-2 transition-all duration-200 bg-white ${
                isSelected
                  ? "border-gh-rose shadow-[0_8px_20px_rgba(255,79,138,0.15)]"
                  : "border-slate-100 hover:border-slate-200"
              }`}
            >
              <div className="p-3">
                <div className="inline-flex rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-black text-emerald-600">
                  {vehicle?.name || "Vehicle"}
                </div>

                {vehicle?.image?.url && (
                  <div className="relative mt-2 h-20 w-full overflow-hidden">
                    <Image
                      src={vehicle.image.url}
                      alt={vehicle.image.alt || vehicle.name}
                      fill
                      className="object-contain mix-blend-multiply"
                    />
                  </div>
                )}

                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                    <span className="text-emerald-500">👤</span>
                    {option.pax} Seats
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                    <span className="text-emerald-500">❄️</span>
                    AC • Driver
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <div className="text-[9px] font-semibold text-slate-400">From</div>
                  <div className="text-[14px] font-black text-slate-900">
                    Rs.{formatInr(option.finalPricePerPerson)}<span className="text-[8px] font-normal text-slate-400">/vehicle</span>
                  </div>
                </div>

                <button
                  type="button"
                  className={`mt-2 w-full rounded-full border border-emerald-600 py-1.5 text-[10px] font-bold transition-all duration-200 ${
                    isSelected
                      ? "bg-emerald-600 text-white"
                      : "bg-transparent text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {isSelected ? "Selected" : "View Details"}
                </button>
              </div>
              {isSelected && (
                <div className="absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-t-full bg-gh-rose" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

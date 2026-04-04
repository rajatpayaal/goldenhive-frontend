import React from "react";
import { PackagesCarousel } from "./PackagesCarousel";

export function PackagesSection({
  packages,
  title = "Exclusive Tour Packages",
  subtitle = "Unforgettable multi-day itineraries perfectly planned for you",
  sectionId,
  aliasIds = [],
}) {
  if (!packages || packages.length === 0) return null;

  return (
    <section id={sectionId} className="scroll-mt-28 w-full">
      {aliasIds.map((id) => (
        <div key={id} id={id} aria-hidden="true" />
      ))}
      <div className="w-full px-5">
        <div className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">{title}</h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">{subtitle}</p>
            </div>
          </div>

          <PackagesCarousel packages={packages} autoSlide />
        </div>
      </div>
    </section>
  );
}

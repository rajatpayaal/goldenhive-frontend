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
        <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm overflow-hidden relative">
          {/* Subtle Background Gradient */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-slate-100 to-slate-50 rounded-full blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex flex-col gap-3 mb-8">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900">{title}</h2>
                <p className="mt-2 text-base font-semibold text-slate-600">{subtitle}</p>
              </div>
            </div>

            <PackagesCarousel packages={packages} autoSlide />
          </div>
        </div>
      </div>
    </section>
  );
}

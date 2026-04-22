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
        <div className="relative overflow-hidden rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.94)] p-8 shadow-[0_20px_55px_rgba(121,68,44,0.12)]">
          <div className="absolute inset-0 opacity-60">
            <div className="absolute -top-10 right-0 h-80 w-80 rounded-full bg-[rgba(255,79,138,0.08)] blur-3xl" />
            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[rgba(255,185,94,0.14)] blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex flex-col gap-3 mb-8">
              <div>
                <h2 className="text-4xl font-black tracking-tight text-[color:var(--gh-heading)]">{title}</h2>
                <p className="mt-2 text-base font-semibold text-[color:var(--gh-text-soft)]">{subtitle}</p>
              </div>
            </div>

            <PackagesCarousel packages={packages} autoSlide />
          </div>
        </div>
      </div>
    </section>
  );
}

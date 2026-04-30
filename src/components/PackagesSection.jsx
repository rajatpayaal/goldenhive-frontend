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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight text-[color:var(--gh-heading)]">
            {title}
          </h2>
          <span className="text-xs font-bold text-gh-rose cursor-pointer">
            View All
          </span>
        </div>
        <PackagesCarousel packages={packages} autoSlide={false} />
      </div>
    </section>
  );
}

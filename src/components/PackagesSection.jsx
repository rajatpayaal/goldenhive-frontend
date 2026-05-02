import React from "react";
import Link from "next/link";
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
      <div className="w-full px-4 sm:px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-extrabold tracking-tight text-slate-800">
            {title}
          </h2>
          <Link
            href={sectionId ? `/${sectionId}` : "/packages"}
            className="text-[11px] font-bold text-[color:var(--gh-accent)] hover:underline"
          >
            View All
          </Link>
        </div>
        <PackagesCarousel packages={packages} autoSlide={false} />
      </div>
    </section>
  );
}


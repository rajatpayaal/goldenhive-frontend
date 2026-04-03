import React from 'react';
import Link from 'next/link';

const getPackageImage = (pkg) => {
  return (
    pkg.images?.primary?.url ||
    pkg.images?.gallery?.[0]?.url ||
    pkg.hero?.image ||
    pkg.hero?.primaryImage ||
    '/placeholder.jpg'
  );
};

const formatDuration = (pkg) => {
  const { durationDays, nights } = pkg.basic || {};
  if (durationDays != null || nights != null) {
    return `${durationDays ?? '-'}D / ${nights ?? '-'}N`;
  }
  return 'Duration TBA';
};

export function PackagesSection({
  packages,
  title = "Exclusive Tour Packages",
  subtitle = "Unforgettable multi-day itineraries perfectly planned for you",
  sectionId,
  aliasIds = [],
}) {
  if (!packages || packages.length === 0) return null;

  return (
    <section id={sectionId} className="scroll-mt-28">
      {aliasIds.map((id) => (
        <div key={id} id={id} aria-hidden="true" />
      ))}
      <div className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">{title}</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">{subtitle}</p>
          </div>
        </div>

        <div className="mt-7 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
          {packages.map((pkg) => (
            <Link
              href={`/package/${pkg.basic?.slug || pkg._id}`}
              key={pkg._id}
              className="group relative w-[320px] shrink-0 snap-start overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(2,6,23,0.10)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                  style={{ backgroundImage: `url(${getPackageImage(pkg)})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-transparent" />

                <div className="absolute left-4 top-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-extrabold text-white backdrop-blur">
                  {formatDuration(pkg)}
                </div>

                {pkg.pricing?.discountPercent > 0 && (
                  <div className="absolute right-4 top-4 inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-white shadow-sm">
                    {pkg.pricing.discountPercent}% OFF
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  {pkg.basic?.destination || "Uttarakhand"}
                </div>
                <h3 className="mt-2 line-clamp-2 text-lg font-black tracking-tight text-slate-900">
                  {pkg.basic?.name || "Untitled journey"}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-600">
                  {pkg.basic?.tagline || "Experience the best of the Himalayas."}
                </p>

                <div className="mt-5 flex items-end justify-between gap-4 border-t border-black/5 pt-4">
                  <div>
                    {pkg.pricing?.discountPercent > 0 && (
                      <div className="text-xs font-bold text-slate-400 line-through">
                        ₹{pkg.pricing.basePrice}
                      </div>
                    )}
                    <div className="flex items-end gap-2">
                      <div className="text-2xl font-black tracking-tight text-slate-900">
                        ₹{pkg.pricing?.finalPrice ?? pkg.basic?.finalPrice ?? "TBA"}
                      </div>
                      <div className="pb-1 text-xs font-semibold text-slate-500">/ person</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white transition group-hover:bg-emerald-600">
                    Explore
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

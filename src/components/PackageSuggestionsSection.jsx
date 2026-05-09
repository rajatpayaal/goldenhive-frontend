import Image from "next/image";
import Link from "next/link";
import { apiService } from "../services/api.service";
import { PackageAddToCart } from "./PackageAddToCart";
import { decodeS3Url } from "@/lib/s3url";

const getPackageImage = (pkg) => {
  return (
    pkg.images?.primary?.url ||
    pkg.images?.gallery?.[0]?.url ||
    pkg.hero?.image ||
    pkg.hero?.primaryImage ||
    "/placeholder.svg"
  );
};

const formatInr = (value) => {
  const numeric = typeof value === "string" && value.trim() === "" ? NaN : Number(value);
  if (Number.isFinite(numeric)) return numeric.toLocaleString("en-IN");
  return value ?? "TBA";
};

export async function PackageSuggestionsSection({
  excludeId,
  limit = 6,
  title = "Suggested Packages",
  subtitle = "Explore similar journeys you might love",
}) {
  const suggestions = await apiService.getPackageSuggestions({
    excludeId,
    limit,
    sort: "-createdAt",
  });

  const safe = (suggestions || []).filter(Boolean).slice(0, limit);
  if (safe.length === 0) return null;

  return (
    <section className="w-full bg-transparent">
      <div className="w-full px-5 pb-10">
        <div className="rounded-2xl border border-[color:var(--gh-border)] bg-white p-7 shadow-gh-soft sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-[color:var(--gh-heading)]">{title}</h2>
              <p className="mt-2 text-sm font-semibold text-[color:var(--gh-text-soft)]">{subtitle}</p>
            </div>
          </div>

          <div className="no-scrollbar mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
            {safe.map((pkg, index) => {
              const href = `/packages/${pkg.basic?.slug || pkg._id}`;
              const imageUrl = getPackageImage(pkg);
              const name = pkg.basic?.name || "Package";
              const destination = pkg.basic?.destination || "Destination TBA";
              const finalPrice = pkg.pricing?.finalPrice ?? pkg.basic?.finalPrice;

              return (
                <div
                  key={pkg._id || pkg.basic?.slug || index}
                  className="relative flex w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[color:var(--gh-border)] bg-white shadow-sm transition hover:shadow-md sm:w-[280px]"
                >
                  <Link href={href} className="group relative aspect-[4/3] w-full overflow-hidden bg-slate-100 block">
                    <Image
                      src={decodeS3Url(imageUrl)}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 280px"
                      loading="lazy"
                    />
                    {pkg.pricing?.discountPercent > 0 && (
                      <div className="absolute left-2 top-2 rounded-full bg-gh-rose px-2 py-0.5 text-[9px] font-black text-white shadow-sm">
                        {pkg.pricing.discountPercent}% OFF
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-col flex-1 p-3 sm:p-4">
                    <Link href={href} className="flex-1 block">
                      <div className="mb-0.5 text-[9px] font-semibold text-slate-400 line-clamp-1">
                        {destination}
                      </div>
                      <h3 className="line-clamp-2 text-xs font-bold leading-tight text-slate-800 sm:text-sm">
                        {name}
                      </h3>
                      <div className="mt-2">
                        <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                          From
                        </div>
                        <div className="text-sm font-bold text-gh-rose">
                          Rs.{formatInr(finalPrice)}
                        </div>
                      </div>
                    </Link>

                    <div className="mt-4 border-t border-[color:var(--gh-border)] pt-3">
                      <PackageAddToCart
                        packageId={pkg._id}
                        packageName={name}
                        packageData={pkg}
                        pricingRequired={pkg?.pricingRequired}
                        showBookNow={true}
                        showMessage={false}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

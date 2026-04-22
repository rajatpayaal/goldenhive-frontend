import Link from "next/link";
import { apiService } from "../services/api.service";
import { PackageAddToCart } from "./PackageAddToCart";

const getPackageImage = (pkg) => {
  return (
    pkg.images?.primary?.url ||
    pkg.images?.gallery?.[0]?.url ||
    pkg.hero?.image ||
    pkg.hero?.primaryImage ||
    "/placeholder.jpg"
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
    <section className="w-full bg-slate-50">
      <div className="w-full px-5 pb-10">
        <div className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">{title}</h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">{subtitle}</p>
            </div>
          </div>

          <div className="no-scrollbar mt-7 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
            {safe.map((pkg, index) => {
              const href = `/package/${pkg.basic?.slug || pkg._id}`;
              const imageUrl = getPackageImage(pkg);
              const name = pkg.basic?.name || "Package";
              const destination = pkg.basic?.destination || "Uttarakhand";
              const tagline = pkg.basic?.tagline;
              const finalPrice = pkg.pricing?.finalPrice ?? pkg.basic?.finalPrice;

              return (
                <div
                  key={pkg._id || pkg.basic?.slug || index}
                  className="relative w-[280px] shrink-0 snap-start overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm sm:w-[330px]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${imageUrl})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-transparent" />
                    <div className="absolute left-4 top-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-extrabold text-white backdrop-blur">
                      {destination}
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <Link href={href} className="group block">
                      <h3 className="line-clamp-2 text-lg font-black tracking-tight text-slate-900 group-hover:text-emerald-700">
                        {name}
                      </h3>
                      {tagline ? (
                        <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-600">
                          {tagline}
                        </p>
                      ) : null}
                    </Link>

                    <div className="mt-5 flex items-end justify-between gap-4 border-t border-black/5 pt-4">
                      <div>
                        <div className="text-2xl font-black tracking-tight text-slate-900">
                          ₹{formatInr(finalPrice)}
                        </div>
                        <div className="text-xs font-semibold text-slate-500">/ person</div>
                      </div>
                      <Link
                        href={href}
                        className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-600"
                      >
                        Explore
                      </Link>
                    </div>

                    <div className="mt-4">
                      <PackageAddToCart
                        packageId={pkg._id}
                        packageName={name}
                        showBookNow={false}
                        showMessage={false}
                        size="sm"
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


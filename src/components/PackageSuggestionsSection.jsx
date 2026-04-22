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
    <section className="w-full bg-transparent">
      <div className="w-full px-5 pb-10">
        <div className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.94)] p-7 shadow-[0_20px_55px_rgba(121,68,44,0.12)] sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-[color:var(--gh-heading)]">{title}</h2>
              <p className="mt-2 text-sm font-semibold text-[color:var(--gh-text-soft)]">{subtitle}</p>
            </div>
          </div>

          <div className="no-scrollbar mt-7 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
            {safe.map((pkg, index) => {
              const href = `/packages/${pkg.basic?.slug || pkg._id}`;
              const imageUrl = getPackageImage(pkg);
              const name = pkg.basic?.name || "Package";
              const destination = pkg.basic?.destination || "Uttarakhand";
              const tagline = pkg.basic?.tagline;
              const finalPrice = pkg.pricing?.finalPrice ?? pkg.basic?.finalPrice;

              return (
                <div
                  key={pkg._id || pkg.basic?.slug || index}
                  className="relative w-[285px] shrink-0 snap-start overflow-hidden rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.98)] shadow-[0_18px_45px_rgba(121,68,44,0.12)] sm:w-[340px]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--gh-bg-soft)]">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${imageUrl})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(31,41,64,0.45)] via-transparent to-transparent" />
                    <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-[linear-gradient(90deg,var(--gh-accent),var(--gh-accent-strong))] px-3 py-1.5 text-xs font-extrabold text-white shadow-[0_10px_25px_rgba(255,79,138,0.25)]">
                      {destination}
                    </div>
                  </div>

                  <div className="space-y-4 p-5 sm:p-6">
                    <Link href={href} className="group block">
                      <h3 className="line-clamp-2 text-[1.6rem] font-black tracking-tight text-[color:var(--gh-heading)] group-hover:text-[color:var(--gh-accent)]">
                        {name}
                      </h3>
                      {tagline ? (
                        <p className="mt-2 line-clamp-2 text-sm font-medium text-[color:var(--gh-text-soft)]">
                          {tagline}
                        </p>
                      ) : null}
                    </Link>

                    <div className="flex items-end justify-between gap-4 border-t border-[color:var(--gh-border)] pt-4">
                      <div>
                        <div className="text-3xl font-black tracking-tight text-[color:var(--gh-accent)]">
                          Rs.{formatInr(finalPrice)}
                        </div>
                        <div className="text-xs font-semibold text-[color:var(--gh-text-soft)]">/ person</div>
                      </div>
                      <Link
                        href={href}
                        className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(90deg,var(--gh-accent),var(--gh-accent-strong))] px-5 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(255,79,138,0.22)]"
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

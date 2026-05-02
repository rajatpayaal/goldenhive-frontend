import Link from "next/link";
import { apiService } from "../../services/api.service";
import { PackagesListClient } from "../../components/PackagesListClient";

export const metadata = {
  title: "All Packages | GoldenHive Holidays",
  description: "Browse all GoldenHive holiday packages, curated getaways, and travel experiences.",
  alternates: { canonical: "/packages" },
};

const getPackageImage = (pkg) =>
  pkg?.images?.primary?.url || pkg?.images?.gallery?.[0]?.url || "/placeholder.jpg";

export default async function PackagesPage() {
  const [packages, categories] = await Promise.all([
    apiService.getAllPackages({ limit: 100, sort: "-createdAt" }),
    apiService.getCategories(),
  ]);

  const activeCategories = (categories || []).filter((c) => c?.isActive !== false);

  return (
    <>
      {/* ── MOBILE only: new app-like list UI ── */}
      <div className="md:hidden">
        <PackagesListClient
          packages={packages}
          categories={activeCategories}
          title="All Packages"
          subtitle="Handpicked journeys for every traveller"
        />
      </div>

      {/* ── DESKTOP/WEB only: original grid layout ── */}
      <main className="hidden md:block px-4 py-8 sm:px-5 sm:py-10">
        <section className="mx-auto max-w-6xl rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.94)] p-4 shadow-[0_20px_55px_rgba(121,68,44,0.12)] sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">
            GoldenHive Holidays
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[color:var(--gh-heading)] sm:text-4xl lg:text-5xl">
            All Packages
          </h1>
          <p className="mt-3 max-w-2xl text-base font-medium text-[color:var(--gh-text-soft)]">
            Discover premium trips styled with the same soft cream and sunset accent theme across the site.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 lg:gap-6">
            {packages.map((pkg) => (
              <Link
                key={pkg._id}
                href={`/packages/${pkg.basic?.slug || pkg._id}`}
                className="group overflow-hidden rounded-[2rem] border border-[color:var(--gh-border)] bg-white shadow-[0_18px_45px_rgba(121,68,44,0.12)] transition hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(255,79,138,0.18)]"
              >
                <div className="relative aspect-[4/3] bg-[color:var(--gh-bg-soft)]">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${getPackageImage(pkg)})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(31,41,64,0.35)] to-transparent" />
                  {pkg.pricing?.discountPercent > 0 && (
                    <div className="absolute left-2.5 top-2.5 rounded-full bg-[color:var(--gh-accent)] px-2.5 py-0.5 text-[9px] font-black text-white shadow-sm">
                      {pkg.pricing.discountPercent}% OFF
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-3 sm:space-y-3 sm:p-5">
                  <div className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[color:var(--gh-accent)] sm:text-xs">
                    {pkg.basic?.destination || "Featured"}
                  </div>
                  <h2 className="line-clamp-2 text-sm font-black leading-snug text-[color:var(--gh-heading)] sm:text-xl">
                    {pkg.basic?.name}
                  </h2>
                  <p className="hidden line-clamp-2 text-xs font-medium text-[color:var(--gh-text-soft)] sm:block sm:line-clamp-3 sm:text-sm">
                    {pkg.basic?.tagline || "Curated holiday experience"}
                  </p>
                  <div className="flex flex-col gap-2 border-t border-[color:var(--gh-border)] pt-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="text-base font-black text-[color:var(--gh-accent)] sm:text-2xl">
                        ₹{Number(pkg.pricing?.finalPrice || 0).toLocaleString("en-IN")}
                      </div>
                      <div className="text-[9px] font-semibold text-[color:var(--gh-text-soft)] sm:text-xs">
                        / person
                      </div>
                    </div>
                    <span className="rounded-full bg-[linear-gradient(90deg,var(--gh-accent),var(--gh-accent-strong))] px-3 py-1.5 text-[9px] font-black text-white sm:px-5 sm:py-2.5 sm:text-sm">
                      View Details
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

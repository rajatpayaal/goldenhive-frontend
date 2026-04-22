import Link from "next/link";
import { apiService } from "../../services/api.service";

export const metadata = {
  title: "All Packages",
  description: "Browse all GoldenHive holiday packages, curated getaways, and travel experiences.",
  alternates: { canonical: "/packages" },
};

const getPackageImage = (pkg) =>
  pkg?.images?.primary?.url || pkg?.images?.gallery?.[0]?.url || "/placeholder.jpg";

export default async function PackagesPage() {
  const packages = await apiService.getAllPackages({ limit: 100, sort: "-createdAt" });

  return (
    <main className="px-5 py-10">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.94)] p-8 shadow-[0_20px_55px_rgba(121,68,44,0.12)]">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">
          GoldenHive Holidays
        </p>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-[color:var(--gh-heading)]">
          All Packages
        </h1>
        <p className="mt-3 max-w-2xl text-base font-medium text-[color:var(--gh-text-soft)]">
          Discover premium trips styled with the same soft cream and sunset accent theme across the site.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg) => (
            <Link
              key={pkg._id}
              href={`/packages/${pkg.basic?.slug || pkg._id}`}
              className="overflow-hidden rounded-[2rem] border border-[color:var(--gh-border)] bg-white shadow-[0_18px_45px_rgba(121,68,44,0.12)] transition hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(255,79,138,0.18)]"
            >
              <div className="relative aspect-[4/3] bg-[color:var(--gh-bg-soft)]">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${getPackageImage(pkg)})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(31,41,64,0.35)] to-transparent" />
              </div>
              <div className="space-y-3 p-5">
                <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[color:var(--gh-accent)]">
                  {pkg.basic?.destination || "Featured"}
                </div>
                <h2 className="line-clamp-2 text-3xl font-black text-[color:var(--gh-heading)]">
                  {pkg.basic?.name}
                </h2>
                <p className="line-clamp-2 text-sm font-medium text-[color:var(--gh-text-soft)]">
                  {pkg.basic?.tagline || "Curated holiday experience"}
                </p>
                <div className="flex items-end justify-between border-t border-[color:var(--gh-border)] pt-4">
                  <div>
                    <div className="text-3xl font-black text-[color:var(--gh-accent)]">
                      Rs.{Number(pkg.pricing?.finalPrice || 0).toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs font-semibold text-[color:var(--gh-text-soft)]">/ person</div>
                  </div>
                  <span className="rounded-full bg-[linear-gradient(90deg,var(--gh-accent),var(--gh-accent-strong))] px-5 py-3 text-sm font-black text-white">
                    View Package
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

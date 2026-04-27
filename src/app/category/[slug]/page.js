import Link from "next/link";
import { notFound } from "next/navigation";
import { apiService } from "../../../services/api.service";
import { getCategoryBySlug } from "../../../lib/package-data";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${category.name} Packages`,
    description: `Explore ${category.name} packages and curated holidays from GoldenHive.`,
    alternates: { canonical: `/category/${slug}` },
  };
}

const getPackageImage = (pkg) =>
  pkg?.images?.primary?.url || pkg?.images?.gallery?.[0]?.url || "/placeholder.jpg";

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const { items } = await apiService.getPackages({
    categoryId: category._id,
    limit: 60,
    sort: "-createdAt",
  });

  return (
    <main className="px-5 py-10">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.94)] p-8 shadow-[0_20px_55px_rgba(121,68,44,0.12)]">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">
          Category Collection
        </p>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-[color:var(--gh-heading)]">
          {category.name}
        </h1>
        <p className="mt-3 max-w-2xl text-base font-medium text-[color:var(--gh-text-soft)]">
          Explore every package available in this travel category.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((pkg) => (
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
              </div>
              <div className="space-y-3 p-5">
                <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[color:var(--gh-accent)]">
                  {pkg.basic?.destination || category.name}
                </div>
                <h2 className="line-clamp-2 text-3xl font-black text-[color:var(--gh-heading)]">
                  {pkg.basic?.name}
                </h2>
                <p className="line-clamp-2 text-sm font-medium text-[color:var(--gh-text-soft)]">
                  {pkg.basic?.tagline || "Curated holiday experience"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

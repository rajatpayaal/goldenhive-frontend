import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiService } from "../../../services/api.service";
import { getCategoryBySlug } from "../../../lib/package-data";
import { decodeS3Url } from "../../../lib/s3url";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found",
      robots: { index: false, follow: false },
    };
  }

  const publishedTime = category.createdAt
    ? new Date(category.createdAt).toISOString()
    : undefined;
  const modifiedTime = category.updatedAt
    ? new Date(category.updatedAt).toISOString()
    : publishedTime;

  return {
    title: `${category.name} Packages`,
    description: `Explore ${category.name} packages and curated holidays from GoldenHive.`,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      title: `${category.name} Packages`,
      description: `Explore ${category.name} packages and curated holidays from GoldenHive.`,
      type: "website",
      siteName: "GoldenHive Holidays",
      url: `/category/${slug}`,
      images: [{ url: "/logo-full.svg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} Packages`,
      description: `Explore ${category.name} packages and curated holidays from GoldenHive.`,
      images: ["/logo-full.svg"],
    },
    other: {
      "article:published_time": publishedTime,
      "article:modified_time": modifiedTime,
    },
  };
}

const getPackageImage = (pkg) =>
  pkg?.images?.primary?.url ||
  pkg?.images?.gallery?.[0]?.url ||
  pkg?.hero?.image ||
  pkg?.hero?.primaryImage ||
  "/placeholder.svg";

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://goldenhiveholidays.in";
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name || "Category",
        item: `${siteUrl}/category/${slug}`,
      },
    ],
  };

  const { items } = await apiService.getPackages({
    categoryId: category._id,
    limit: 60,
    sort: "-createdAt",
  });

  return (
    <main className="px-4 py-8 sm:px-5 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.94)] p-5 shadow-[0_20px_55px_rgba(121,68,44,0.12)] sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">
          Category Collection
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-[color:var(--gh-heading)] sm:text-4xl lg:text-5xl">
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
              <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--gh-bg-soft)]">
                <Image
                  src={decodeS3Url(getPackageImage(pkg))}
                  alt={pkg.basic?.name || "Package"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  loading="lazy"
                />
              </div>
              <div className="space-y-3 p-5">
                <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[color:var(--gh-accent)]">
                  {pkg.basic?.destination || category.name}
                </div>
                <h2 className="line-clamp-2 text-2xl font-black text-[color:var(--gh-heading)] sm:text-3xl">
                  {pkg.basic?.name}
                </h2>
                <p className="line-clamp-3 text-sm font-medium text-[color:var(--gh-text-soft)]">
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

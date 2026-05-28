import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiService } from "../../../services/api.service";
import { decodeS3Url } from "../../../lib/s3url";
import { Breadcrumbs } from "../../../components/Breadcrumbs";

const getCampaignImage = (campaign) => {
  return campaign?.mediaImage || "/placeholder.svg";
};

export async function generateMetadata({ params }) {
  const { id } = await params;
  const campaign = await apiService.getCampaignById(id);

  if (!campaign) {
    return {
      title: "Campaign Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = campaign.seo?.metaTitle || campaign.title || "Campaign";
  const description =
    campaign.seo?.metaDescription ||
    campaign.subtitle ||
    campaign.description ||
    "Explore the latest offers from GoldenHive Holidays.";
  const ogImage = campaign.mediaImage ? [campaign.mediaImage] : [];

  return {
    title: `${title} | GoldenHive Holidays`,
    description,
    alternates: { canonical: `/campaigns/${campaign._id}` },
    openGraph: {
      title: `${title} | GoldenHive Holidays`,
      description,
      type: "website",
      siteName: "GoldenHive Holidays",
      url: `/campaigns/${campaign._id}`,
      images: ogImage.map((url) => ({ url })),
    },
    twitter: {
      card: ogImage.length > 0 ? "summary_large_image" : "summary",
      title: `${title} | GoldenHive Holidays`,
      description,
      images: ogImage,
    },
  };
}

export default async function CampaignDetailPage({ params }) {
  const { id } = await params;
  const campaign = await apiService.getCampaignById(id);

  if (!campaign) notFound();

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
        name: "Campaigns",
        item: `${siteUrl}/campaigns`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: campaign.title || "Campaign",
        item: `${siteUrl}/campaigns/${campaign._id}`,
      },
    ],
  };

  const offerDescriptionParts = [
    campaign.subtitle,
    campaign.description,
    campaign.couponCode ? `Coupon code: ${campaign.couponCode}` : null,
    campaign.discountPercent ? `${campaign.discountPercent}% discount` : null,
  ].filter(Boolean);

  const offerSchema = {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: campaign.title || "Campaign Offer",
    description: offerDescriptionParts.join(". ") || "Limited-time offer.",
    url: `${siteUrl}/campaigns/${campaign._id}`,
    validFrom: campaign.startDate || undefined,
    validThrough: campaign.endDate || undefined,
    seller: {
      "@type": "Organization",
      name: "GoldenHive Holidays",
      url: "https://goldenhiveholidays.in",
    },
    itemOffered: {
      "@type": "Service",
      name: campaign.title || "Campaign",
    },
  };

  const linkedPackages = Array.isArray(campaign.linkedPackages)
    ? campaign.linkedPackages
    : [];

  return (
    <main className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerSchema) }}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-5 sm:py-12">
        <Breadcrumbs
          items={[
            { href: "/campaigns", label: "Campaigns" },
            { href: `/campaigns/${campaign._id}`, label: campaign.title || "Campaign" },
          ]}
        />

        <section className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] p-6 shadow-[0_18px_45px_rgba(121,68,44,0.10)] sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">
                Limited Offer
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-[color:var(--gh-heading)] sm:text-4xl">
                {campaign.title}
              </h1>
              {campaign.subtitle ? (
                <p className="mt-3 text-sm font-semibold text-[color:var(--gh-text-soft)]">
                  {campaign.subtitle}
                </p>
              ) : null}
              {campaign.description ? (
                <p className="mt-4 text-sm font-medium leading-7 text-[color:var(--gh-text)]">
                  {campaign.description}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-3">
                {campaign.discountPercent ? (
                  <span className="rounded-full bg-rose-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-[color:var(--gh-accent)]">
                    {campaign.discountPercent}% Off
                  </span>
                ) : null}
                {campaign.couponCode ? (
                  <span className="rounded-full border border-[color:var(--gh-border)] bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-[color:var(--gh-heading)]">
                    Use Code: {campaign.couponCode}
                  </span>
                ) : null}
              </div>

              {campaign.targetUrl ? (
                <div className="mt-6">
                  <Link
                    href={campaign.targetUrl}
                    className="gh-primary-btn inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-black"
                  >
                    {campaign.ctaText || "Book Now"}
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="relative overflow-hidden rounded-[1.8rem] border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] shadow-[0_18px_45px_rgba(121,68,44,0.10)]">
              <Image
                src={decodeS3Url(getCampaignImage(campaign))}
                alt={campaign.title || "Campaign"}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 360px, 100vw"
                priority
              />
            </div>
          </div>
        </section>

        {linkedPackages.length > 0 ? (
          <section className="mt-8 rounded-[2rem] border border-[color:var(--gh-border)] bg-white p-6 shadow-[0_18px_45px_rgba(121,68,44,0.08)] sm:p-8">
            <h2 className="text-xl font-black text-[color:var(--gh-heading)]">Featured Packages</h2>
            <p className="mt-2 text-sm font-semibold text-[color:var(--gh-text-soft)]">
              Curated picks linked to this campaign.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {linkedPackages.map((pkg) => (
                <Link
                  key={pkg._id}
                  href={`/packages/${pkg.basic?.slug || pkg._id}`}
                  className="overflow-hidden rounded-[1.6rem] border border-[color:var(--gh-border)] bg-white shadow-[0_16px_40px_rgba(121,68,44,0.10)] transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(255,79,138,0.15)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--gh-bg-soft)]">
                    <Image
                      src={decodeS3Url(pkg.images?.primary?.url || pkg.images?.gallery?.[0]?.url || "/placeholder.svg")}
                      alt={pkg.basic?.name || "Package"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--gh-accent)]">
                      {pkg.basic?.destination || "Featured"}
                    </div>
                    <h3 className="line-clamp-2 text-base font-black text-[color:var(--gh-heading)]">
                      {pkg.basic?.name}
                    </h3>
                    <p className="line-clamp-2 text-xs font-medium text-[color:var(--gh-text-soft)]">
                      {pkg.basic?.tagline || "Curated holiday experience"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

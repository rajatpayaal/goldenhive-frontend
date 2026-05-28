import Link from "next/link";
import Image from "next/image";
import { apiService } from "../../services/api.service";
import { decodeS3Url } from "../../lib/s3url";

export const metadata = {
  title: "Campaigns | GoldenHive Holidays",
  description: "Discover limited-time offers and curated campaign packages from GoldenHive Holidays.",
  alternates: { canonical: "/campaigns" },
  openGraph: {
    title: "Campaigns | GoldenHive Holidays",
    description: "Discover limited-time offers and curated campaign packages from GoldenHive Holidays.",
    type: "website",
    siteName: "GoldenHive Holidays",
    url: "/campaigns",
    images: [{ url: "/logo-full.svg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Campaigns | GoldenHive Holidays",
    description: "Discover limited-time offers and curated campaign packages from GoldenHive Holidays.",
    images: ["/logo-full.svg"],
  },
};

const getCampaignImage = (campaign) => campaign?.mediaImage || "/placeholder.svg";

export default async function CampaignsPage() {
  const campaigns = await apiService.getActiveCampaigns();

  return (
    <main className="pb-20">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-5 sm:py-12">
        <div className="mb-10 rounded-2xl border border-[color:var(--gh-border)] bg-white px-6 py-8 shadow-gh-soft sm:px-10 sm:py-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">
            GoldenHive Holidays
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[color:var(--gh-heading)] sm:text-4xl lg:text-5xl">
            Campaigns
          </h1>
          <p className="mt-3 max-w-2xl text-base font-medium text-[color:var(--gh-text-soft)]">
            Explore limited-time offers and curated holiday experiences.
          </p>
        </div>

        {campaigns.length === 0 ? (
          <div className="rounded-2xl border border-[color:var(--gh-border)] bg-white py-16 text-center shadow-gh-soft">
            <p className="text-base font-semibold text-[color:var(--gh-text-soft)]">No active campaigns right now.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <Link
                key={campaign._id}
                href={`/campaigns/${campaign._id}`}
                className="group overflow-hidden rounded-2xl border border-[color:var(--gh-border)] bg-white shadow-gh-soft transition hover:-translate-y-1 hover:shadow-gh-medium"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--gh-bg-soft)]">
                  <Image
                    src={decodeS3Url(getCampaignImage(campaign))}
                    alt={campaign.title || "Campaign"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  {campaign.discountPercent ? (
                    <div className="absolute left-3 top-3 rounded-full bg-[color:var(--gh-accent)] px-3 py-1 text-[9px] font-black text-white shadow-sm">
                      {campaign.discountPercent}% OFF
                    </div>
                  ) : null}
                </div>
                <div className="space-y-2 p-5">
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[color:var(--gh-accent)]">
                    {campaign.type || "Campaign"}
                  </div>
                  <h2 className="line-clamp-2 text-xl font-black text-[color:var(--gh-heading)]">
                    {campaign.title}
                  </h2>
                  <p className="line-clamp-2 text-sm font-medium text-[color:var(--gh-text-soft)]">
                    {campaign.subtitle || campaign.description || "Limited-time offer"}
                  </p>
                  <div className="pt-3 text-sm font-black text-[color:var(--gh-accent)]">
                    {campaign.ctaText || "View Campaign"} →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

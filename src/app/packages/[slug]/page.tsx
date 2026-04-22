import type { Metadata } from "next";

import { TravelPackagePage } from "@/components/travel-package/TravelPackagePage";
import { fetchTravelPackageBySlug } from "@/lib/travel-package";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchTravelPackageBySlug(slug);

  return {
    title: data.hero.title,
    description: data.hero.subtitle,
    openGraph: {
      title: data.hero.title,
      description: data.hero.subtitle,
      images: [{ url: data.images.primary.url }],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await fetchTravelPackageBySlug(slug);

  return <TravelPackagePage data={data} />;
}


import HomeContent from "./HomeContent";

export const metadata = {
  title: "GoldenHive Holidays | Tours, Activities & Packages, Corporate Tour, Char Dham",
  description:
    "Plan Char Dham Yatra with GoldenHive Holidays. Book Travel Packages, Hotels, Cab Services, and India Tours tailored for every journey.",
  keywords: ["Kedarnath Yatra", "Rishikesh Rafting", "Char Dham", "Uttarakhand Tourism"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "GoldenHive Holidays | Tours, Activities & Packages, Corporate Tour, Char Dham",
    description:
      "Plan Char Dham Yatra with GoldenHive Holidays. Book Travel Packages, Hotels, Cab Services, and India Tours tailored for every journey.",
    url: "/",
    siteName: "GoldenHive Holidays",
    images: [{ url: "/logo-full.svg" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoldenHive Holidays | Tours, Activities & Packages, Corporate Tour, Char Dham",
    description:
      "Plan Char Dham Yatra with GoldenHive Holidays. Book Travel Packages, Hotels, Cab Services, and India Tours tailored for every journey.",
    images: ["/logo-full.svg"],
  },
};

export default async function HomePage() {
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
    ],
  };

  return (
    <>
      <h1 className="sr-only">GoldenHive Holidays</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <HomeContent />
    </>
  );
}

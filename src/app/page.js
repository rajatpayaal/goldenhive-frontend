import HomeContent from "./HomeContent";

export const metadata = {
  title: "GoldenHive | Tours, Activities & Packages",
  description: "Book affordable premium packages and exclusive experiences.",
  keywords: ["Kedarnath Yatra", "Rishikesh Rafting", "Char Dham", "Uttarakhand Tourism"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Premium Travel Agency",
    description: "Experience divine journeys and activities.",
    url: "/",
    siteName: "GoldenHive",
    images: [{ url: "/logo-full.svg" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Travel Agency",
    description: "Experience divine journeys and activities.",
    images: ["/logo-full.svg"],
  },
};

export default async function HomePage() {
  return (
    <>
      <h1 className="sr-only">GoldenHive Holidays</h1>
      <HomeContent />
    </>
  );
}

import HomeContent from "./HomeContent";

export const metadata = {
  title: "GoldenHive | Tours, Activities & Packages",
  description: "Book affordable premium packages and exclusive experiences.",
  keywords: ["Kedarnath Yatra", "Rishikesh Rafting", "Char Dham", "Uttarakhand Tourism"],
  openGraph: {
    title: "Premium Travel Agency",
    description: "Experience divine journeys and activities.",
    url: "https://goldenhive-frontend.vercel.app",
    siteName: "GoldenHive",
    images: [],
    locale: "en_IN",
    type: "website",
  },
};

export default async function HomePage() {
  return <HomeContent />;
}

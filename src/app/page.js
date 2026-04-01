import { BannerSlider } from "../components/BannerSlider";
import { ActivitiesSection } from "../components/ActivitiesSection";
import { PackagesSection } from "../components/PackagesSection";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import styles from "./page.module.css";
import Link from "next/link";

import { apiService } from "../services/api.service";

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
  const [banners, activities, packages] = await Promise.all([
    apiService.getHomeBanners(),
    apiService.getHomeActivities(),
    apiService.getHomePackages()
  ]);

  return (
    <>
      <Header />

      <main className={styles.main}>
        <BannerSlider banners={banners} />
        <div id="activities">
          <ActivitiesSection activities={activities} />
        </div>
        <div id="packages">
          <PackagesSection packages={packages} />
        </div>
      </main>

      <Footer />
    </>
  );
}

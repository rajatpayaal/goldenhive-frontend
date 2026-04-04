import { BannerSlider } from "../components/BannerSlider";
import { PackagesSection } from "../components/PackagesSection";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

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
  const [banners, categories, footer] = await Promise.all([
    apiService.getHomeBanners(),
    apiService.getCategories(),
    apiService.getFooter({ isActive: true })
  ]);

  const activeCategories = (categories || []).filter((category) => category?.isActive !== false);

  const packagesBySlug = Object.fromEntries(
    await Promise.all(
      activeCategories.map(async (category) => {
        const { items } = await apiService.getPackages({ categoryName: category.name });
        return [category.slug, items];
      })
    )
  );

  return (
    <>
      <Header categories={activeCategories} />

      <main className="bg-slate-50">
        <BannerSlider banners={banners} />

        <div className="space-y-10 py-10">
          {activeCategories.map((category) => (
            <PackagesSection
              key={category._id || category.slug}
              sectionId={category.slug}
              aliasIds={category.slug === "tour-packages" ? ["packages"] : []}
              title={category.name}
              packages={packagesBySlug[category.slug] || []}
            />
          ))}
        </div>
      </main>

      <Footer footer={footer} />
    </>
  );
}

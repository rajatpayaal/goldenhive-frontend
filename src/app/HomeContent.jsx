import { BannerSlider } from "../components/BannerSlider";
import { CustomRequestCallout } from "../components/CustomRequestCallout";
import { PackagesSection } from "../components/PackagesSection";
import { apiService } from "../services/api.service";
import ScrollToSection from "../components/ScrollToSection";

export default async function HomeContent({ initialSection }) {
  const [banners, categories] = await Promise.all([
    apiService.getHomeBanners(),
    apiService.getCategories(),
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
    <main className="bg-slate-50">
      {initialSection ? <ScrollToSection sectionId={initialSection} /> : null}
      <BannerSlider banners={banners} />
      <CustomRequestCallout />

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
  );
}

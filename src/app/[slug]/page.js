import { apiService } from "../../services/api.service";
import { PackagesListClient } from "../../components/PackagesListClient";
import HomeContent from "../HomeContent";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const categories = await apiService.getCategories();
  const cat = categories?.find((c) => c?.slug === slug);
  return {
    title: cat?.name ? `${cat.name} | GoldenHive` : "Packages | GoldenHive",
    description: cat?.description || "Browse curated travel packages from GoldenHive Holidays.",
  };
}

export default async function SectionPage({ params }) {
  const { slug } = await params;

  const categories = await apiService.getCategories();
  const activeCategories = (categories || []).filter((c) => c?.isActive !== false);
  const matchedCategory = activeCategories.find((c) => c?.slug === slug);

  if (matchedCategory) {
    const { items: packages } = await apiService.getPackages({
      categoryId: matchedCategory._id,
      limit: 60,
      sort: "-createdAt",
    });

    return (
      <>
        {/* ── MOBILE only: new app-like package list UI ── */}
        <div className="md:hidden">
          <PackagesListClient
            packages={packages || []}
            categories={activeCategories}
            title={matchedCategory.name}
            subtitle={matchedCategory.description || "Handpicked journeys for a divine experience"}
            activeCategorySlug={matchedCategory.slug}
          />
        </div>

        {/* ── DESKTOP/WEB only: homepage scrolled to section (original behavior) ── */}
        <div className="hidden md:block">
          <HomeContent initialSection={slug} />
        </div>
      </>
    );
  }

  // Non-category slug: always show homepage scrolled to section
  return <HomeContent initialSection={slug} />;
}

import Link from "next/link";
import {
  Church,
  Map,
  Binoculars,
  Car,
  Zap,
  Mountain,
  Waves,
  Tent,
  Bike,
  Camera,
  Compass,
  Star,
  Globe,
  Sailboat,
  TreePine,
  Flame,
  Gift,
  Umbrella,
  UtensilsCrossed,
  Heart,
} from "lucide-react";

// Map category slug → Lucide icon component
const CATEGORY_ICON_MAP = {
  "spiritual-tours": Church,
  "spiritual": Church,
  "tour-packages": Map,
  "packages": Map,
  "right-seeing": Binoculars,
  "sightseeing": Binoculars,
  "city-tours": Binoculars,
  "taxi-service": Car,
  "cab": Car,
  "transport": Car,
  "activities": Zap,
  "adventure": Mountain,
  "water-sports": Waves,
  "camping": Tent,
  "trekking": Bike,
  "photography": Camera,
  "exploration": Compass,
  "premium": Star,
  "international": Globe,
  "cruises": Sailboat,
  "nature": TreePine,
  "pilgrimage": Flame,
  "honeymoon": Gift,
  "beach": Umbrella,
  "food": UtensilsCrossed,
  "wellness": Heart,
};

function getCategoryIcon(slug = "", name = "") {
  const key = slug.toLowerCase();
  if (CATEGORY_ICON_MAP[key]) return CATEGORY_ICON_MAP[key];

  // Fallback: fuzzy match on name
  const nameLower = name.toLowerCase();
  for (const [mapKey, icon] of Object.entries(CATEGORY_ICON_MAP)) {
    if (nameLower.includes(mapKey.replace(/-/g, " ")) || mapKey.replace(/-/g, " ").includes(nameLower)) {
      return icon;
    }
  }
  return Compass; // default
}

// Gradient palette — cycles through for variety
const GRADIENTS = [
  "from-rose-400 to-pink-500",
  "from-orange-400 to-rose-500",
  "from-fuchsia-400 to-pink-500",
  "from-pink-400 to-red-500",
  "from-red-400 to-rose-600",
  "from-purple-400 to-pink-500",
];

export function TopCategoriesSection({ categories = [] }) {
  const activeCategories = categories.filter((c) => c?.isActive !== false && c?.name && c?.slug);

  if (activeCategories.length === 0) return null;

  return (
    <section className="md:hidden w-full py-5 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[17px] font-extrabold tracking-tight text-slate-800">
          Top Categories
        </h2>
        <Link
          href="/packages"
          className="text-xs font-bold text-[color:var(--gh-accent)] hover:underline"
        >
          View All
        </Link>
      </div>

      {/* Scrollable category row */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        {activeCategories.map((category, index) => {
          const IconComponent = getCategoryIcon(category.slug, category.name);
          const gradient = GRADIENTS[index % GRADIENTS.length];

          return (
            <Link
              key={category._id || category.slug}
              href={`/${category.slug}`}
              className="group flex flex-col items-center gap-2 flex-shrink-0"
              style={{ minWidth: "64px" }}
            >
              {/* Pink circle with icon */}
              <div
                className={`relative flex h-[58px] w-[58px] items-center justify-center rounded-full bg-gradient-to-br ${gradient} shadow-[0_6px_20px_rgba(225,29,72,0.28)] transition-transform duration-200 active:scale-95 group-hover:scale-105`}
              >
                {/* Inner white circle (subtle) */}
                <div className="absolute inset-[6px] rounded-full bg-white/20" />
                <IconComponent
                  className="relative h-[26px] w-[26px] text-white drop-shadow-sm"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </div>

              {/* Label */}
              <span className="text-center text-[10px] font-semibold leading-tight text-slate-600 max-w-[64px] line-clamp-2 group-hover:text-[color:var(--gh-accent)] transition-colors">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

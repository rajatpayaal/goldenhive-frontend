import { apiService } from "../../../services/api.service";
import Link from "next/link";
import { PackageAddToCart } from "../../../components/PackageAddToCart";
import { PackageSuggestionsSection } from "../../../components/PackageSuggestionsSection";
import { PricingOptionsSelector } from "../../../components/PricingOptionsSelector";
import { PricingSidebarSync } from "../../../components/PricingSidebarSync";
import { Breadcrumbs } from "../../../components/Breadcrumbs";

async function resolvePackageId(slugOrId) {
  const decoded = decodeURIComponent(slugOrId || "");
  if (/^[0-9a-fA-F]{24}$/.test(decoded)) return decoded;

  const trySearch = async (search) => {
    const { items } = await apiService.getPackages({
      search,
      page: 1,
      limit: 100,
      sort: "-createdAt",
    });
    const matched = items.find((pkg) => pkg.basic?.slug === decoded);
    return matched ? matched._id : null;
  };

  // Some backends search by name/destination, not by slug. Try both.
  const bySlugQuery = await trySearch(decoded);
  if (bySlugQuery) return bySlugQuery;

  const byNameQuery = await trySearch(decoded.replace(/-/g, " "));
  if (byNameQuery) return byNameQuery;

  // Fallback: search within each category list.
  const categories = await apiService.getCategories();
  for (const category of categories || []) {
    const { items } = await apiService.getPackages({
      categoryName: category.name,
      page: 1,
      limit: 100,
      sort: "-createdAt",
    });
    const matched = items.find((pkg) => pkg.basic?.slug === decoded);
    if (matched?._id) return matched._id;
  }

  return null;
}

const cleanText = (value) => {
  const text = String(value ?? "").trim();
  if (
    text.length >= 2 &&
    ((text.startsWith('"') && text.endsWith('"')) ||
      (text.startsWith("'") && text.endsWith("'")))
  ) {
    return text.slice(1, -1);
  }
  return text;
};

const toLabel = (key) => {
  return String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDateTime = (isoString) => {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getHeroImage = (pkg) => {
  return (
    pkg.images?.primary?.url ||
    pkg.images?.gallery?.[0]?.url ||
    "/placeholder.jpg"
  );
};

const getFaqItems = (pkg) => {
  const raw = pkg?.faqId ?? pkg?.faq ?? pkg?.faqs ?? [];
  const items = Array.isArray(raw) ? raw : [];
  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const question = item.question || item.q || item.title || item.name;
      const answer = item.answer || item.a || item.description || item.text;
      if (!question && !answer) return null;
      return { question: cleanText(question || "FAQ"), answer: cleanText(answer || "") };
    })
    .filter(Boolean);
};

export async function generateMetadata(context) {
  const { id } = await context.params;
  const resolvedId = await resolvePackageId(id);
  const pkg = resolvedId ? await apiService.getPackageById(resolvedId) : null;

  if (!pkg) {
    return {
      title: "Package Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = pkg.seo?.metaTitle || `${pkg.basic?.name} | GoldenHive`;
  const description =
    pkg.seo?.metaDescription ||
    pkg.overview?.short ||
    pkg.basic?.tagline ||
    "Explore this package on GoldenHive.";

  const keywords = Array.from(
    new Set(
      [
        ...(pkg.seo?.keywords || []),
        ...(pkg.basic?.tags || []),
        pkg.basic?.destination,
        pkg.categoryId?.name,
      ].filter(Boolean)
    )
  );

  const canonicalPath = `/package/${pkg.basic?.slug || pkg._id}`;
  const primaryImage = pkg.images?.primary?.url;
  const galleryImages = (pkg.images?.gallery || [])
    .map((img) => img?.url)
    .filter(Boolean);
  const ogImages = [primaryImage, ...galleryImages].filter(Boolean).slice(0, 3);

  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonicalPath },
    robots: {
      index: pkg.meta?.status === "ACTIVE",
      follow: pkg.meta?.status === "ACTIVE",
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalPath,
      siteName: "GoldenHive",
      images: ogImages.map((url) => ({
        url,
        alt: pkg.images?.primary?.alt || pkg.basic?.name || "GoldenHive package",
      })),
    },
    twitter: {
      card: ogImages.length > 0 ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImages,
    },
  };
}

export default async function PackageDetailsPage(context) {
  const { id } = await context.params;
  const resolvedId = await resolvePackageId(id);
  const pkg = resolvedId ? await apiService.getPackageById(resolvedId) : null;

  if (!pkg) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center px-5 py-24 text-center">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Package not found or inactive.</h2>
        <p className="mt-2 text-sm font-semibold text-slate-600">
          Try going back to the homepage and selecting another package.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-4 text-sm font-black text-white hover:bg-emerald-600"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const heroImage = getHeroImage(pkg);
  const gallery = pkg.images?.gallery || [];
  const whatsapp = (pkg.cta?.whatsapp || "").replace("+", "");
  const backHref = pkg.categoryId?.slug ? `/${pkg.categoryId.slug}` : "/tour-packages";

  const quickInfoEntries = Object.entries(pkg.quickInfo || {}).filter(([, value]) => value !== undefined && value !== null && value !== "");
  const travelInfoEntries = Object.entries(pkg.travelInfo || {}).filter(([, value]) => value !== undefined && value !== null && value !== "");
  const policyEntries = Object.entries(pkg.policies || {}).filter(([, value]) => value !== undefined && value !== null && value !== "");
  const faqItems = getFaqItems(pkg);

  const visible = pkg.visibility || {};
  const show = {
    quickInfo: visible.quickInfo !== false && quickInfoEntries.length > 0,
    overview: visible.overview !== false,
    highlights: visible.highlights !== false && (pkg.highlights || []).length > 0,
    whyChooseUs: visible.whyChooseUs !== false && (pkg.whyChooseUs || []).length > 0,
    inclusions: visible.inclusions !== false || visible.exclusions !== false,
    itinerary: visible.itinerary !== false && (pkg.itinerary || []).length > 0,
    gallery: visible.gallery !== false && gallery.length > 0,
    travelPolicies: (travelInfoEntries.length > 0 || policyEntries.length > 0),
    location: Boolean(pkg.location?.address || pkg.location?.mapUrl),
    faq: (visible.faq !== false && faqItems.length > 0),
  };

  return (
    <div className="bg-slate-50 pb-20">
      <div className="mx-auto max-w-6xl px-5 pt-8">
        <Breadcrumbs
          items={[
            { href: backHref, label: pkg.categoryId?.name || "Tour Packages" },
            { href: `/package/${pkg.basic?.slug || pkg._id}`, label: pkg.basic?.name || "Package Details" },
          ]}
        />
      </div>

      <div className="relative overflow-hidden rounded-b-3xl shadow-2xl">
        {/* Premium Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

        <div className="relative">
          <div className="container">
            <div className="min-h-[520px] flex flex-col justify-end pb-16 pt-24 text-white">
              <Link
                href={backHref}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur px-4 py-2 text-sm font-semibold hover:bg-white/20 transition"
              >
                <span aria-hidden="true">←</span> Back
              </Link>

              {/* Premium Badge Section */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-emerald-400/50 bg-emerald-500/15 px-4 py-2.5 text-sm font-extrabold backdrop-blur text-emerald-200">
                  🗓️ {pkg.basic?.durationDays}D / {pkg.basic?.nights}N
                </span>
                {pkg.categoryId?.name && (
                  <span className="inline-flex items-center rounded-full border border-blue-400/50 bg-blue-500/15 px-4 py-2.5 text-sm font-bold backdrop-blur text-blue-200">
                    📍 {pkg.categoryId.name}
                  </span>
                )}
                {pkg.basic?.destination && (
                  <span className="inline-flex items-center rounded-full border border-purple-400/50 bg-purple-500/15 px-4 py-2.5 text-sm font-bold backdrop-blur text-purple-200">
                    🏔️ {pkg.basic.destination}
                  </span>
                )}
              </div>

              {/* Premium Heading */}
              <h1 className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight drop-shadow-2xl">
                {pkg.hero?.title || pkg.basic?.name}
              </h1>
              <p className="mt-6 max-w-2xl text-xl text-white/90 font-semibold leading-relaxed drop-shadow-lg">
                {pkg.hero?.subtitle || pkg.basic?.tagline}
              </p>

              {/* Premium CTA Badges */}
              {(pkg.hero?.badges || []).length > 0 && (
                <div className="mt-8 flex flex-wrap gap-3" aria-label="Highlights badges">
                  {pkg.hero.badges.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center rounded-full border border-white/30 bg-white/10 backdrop-blur px-4 py-2.5 text-sm font-bold text-white/95"
                    >
                      ✨ {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            {show.quickInfo && (
              <section className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm overflow-hidden">
                <div className="flex items-end justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">Quick Info</h2>
                    <p className="mt-2 text-sm font-semibold text-slate-500">Everything at a glance</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {quickInfoEntries.map(([key, value]) => (
                    <div key={key} className="group rounded-2xl border border-black/5 bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 hover:border-slate-200 hover:shadow-md transition-all">
                      <div className="text-[11px] font-black uppercase tracking-wider text-slate-600 mb-2">
                        {toLabel(key)}
                      </div>
                      <div className="text-base font-black text-slate-900 group-hover:text-slate-950">
                        {cleanText(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {show.overview && (
              <section className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Overview</h2>
                <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-slate-600">
                  {pkg.overview?.long || pkg.overview?.short || pkg.basic?.tagline}
                </p>
              </section>
            )}

            {(pkg.pricingOptions || []).length > 0 && (
              <PricingOptionsSelector
                packageId={pkg._id}
                packageName={pkg.basic?.name}
                pricingOptions={pkg.pricingOptions}
              />
            )}

            {show.highlights && (
              <section className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm overflow-hidden">
                <div className="mb-8">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">Highlights</h2>
                  <p className="mt-2 text-sm font-semibold text-slate-500">What makes this special</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {pkg.highlights.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-5 py-3 text-sm font-black text-emerald-900 hover:border-emerald-300 hover:shadow-md transition-all"
                    >
                      <span>✨</span> {item}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {show.whyChooseUs && (
              <section className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm overflow-hidden">
                <div className="mb-8">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">Why Choose This</h2>
                  <p className="mt-2 text-sm font-semibold text-slate-500">Reasons to pick us</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {pkg.whyChooseUs.map((item, idx) => (
                    <div
                      key={item}
                      className="group flex items-start gap-4 rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/50 p-5 hover:border-emerald-200 hover:from-emerald-50 hover:to-emerald-100/30 transition-all"
                    >
                      <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-black">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-sm font-black text-slate-900 group-hover:text-slate-950">{item}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {show.inclusions && (
              <section className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Inclusions & Exclusions</h2>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-black/5 bg-slate-50 p-5">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-600">Inclusions</h3>
                    {(pkg.inclusions || []).length > 0 ? (
                      <ul className="mt-4 space-y-2">
                        {pkg.inclusions.map((item) => (
                          <li key={item} className="flex items-start gap-3 text-sm font-semibold text-slate-800">
                            <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700">
                              +
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm font-semibold text-slate-500">Not specified.</p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-black/5 bg-slate-50 p-5">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-600">Exclusions</h3>
                    {(pkg.exclusions || []).length > 0 ? (
                      <ul className="mt-4 space-y-2">
                        {pkg.exclusions.map((item) => (
                          <li key={item} className="flex items-start gap-3 text-sm font-semibold text-slate-800">
                            <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/15 text-rose-700">
                              -
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm font-semibold text-slate-500">Not specified.</p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {show.itinerary && (
              <section className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Itinerary</h2>
                <div className="mt-6 space-y-3">
                  {pkg.itinerary.map((dayItem) => (
                    <div
                      key={dayItem.day ?? dayItem.title}
                      className="rounded-2xl border border-black/5 bg-slate-50 p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-sky-500/10 px-3 py-1 text-sm font-extrabold text-sky-700">
                            Day {dayItem.day ?? "-"}
                          </span>
                          <span className="text-base font-black text-slate-900">{dayItem.title}</span>
                        </div>
                        {(dayItem.meals || dayItem.stay) && (
                          <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                            {dayItem.meals && (
                              <span className="rounded-full border border-black/5 bg-white px-3 py-1">
                                Meals: {cleanText(dayItem.meals)}
                              </span>
                            )}
                            {dayItem.stay && (
                              <span className="rounded-full border border-black/5 bg-white px-3 py-1">
                                Stay: {cleanText(dayItem.stay)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {dayItem.description && (
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          {cleanText(dayItem.description)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {show.gallery && (
              <section className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm overflow-hidden">
                <div className="flex items-end justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">Gallery</h2>
                    <p className="mt-2 text-sm font-semibold text-slate-500">Explore stunning visuals</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {gallery.map((img, i) => (
                    <div
                      key={img.url || i}
                      className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-br from-slate-100 to-slate-50 shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                      <img 
                        src={img.url}
                        alt={img.alt || `Package image ${i + 1}`}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      {/* Image Counter Badge */}
                      <div className="absolute bottom-3 right-3 inline-flex items-center rounded-full bg-black/40 backdrop-blur px-3 py-1 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {i + 1}/{gallery.length}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {show.travelPolicies && (
              <section className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Travel & Policies</h2>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-black/5 bg-slate-50 p-5">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-600">Travel Info</h3>
                    {travelInfoEntries.length > 0 ? (
                      <ul className="mt-4 space-y-2">
                        {travelInfoEntries.map(([key, value]) => (
                          <li
                            key={key}
                            className="flex items-baseline justify-between gap-4 rounded-xl border border-black/5 bg-white px-4 py-3"
                          >
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                              {toLabel(key)}
                            </span>
                            <span className="text-sm font-bold text-slate-800">{cleanText(value)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm font-semibold text-slate-500">Not specified.</p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-black/5 bg-slate-50 p-5">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-600">Policies</h3>
                    {policyEntries.length > 0 ? (
                      <ul className="mt-4 space-y-2">
                        {policyEntries.map(([key, value]) => (
                          <li
                            key={key}
                            className="flex items-baseline justify-between gap-4 rounded-xl border border-black/5 bg-white px-4 py-3"
                          >
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                              {toLabel(key)}
                            </span>
                            <span className="text-sm font-bold text-slate-800">{cleanText(value)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm font-semibold text-slate-500">Not specified.</p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {show.location && (
              <section className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Location</h2>
                {pkg.location?.address && (
                  <p className="mt-4 text-[15px] font-semibold leading-7 text-slate-700">
                    {pkg.location.address}
                  </p>
                )}
                {pkg.location?.mapUrl && (
                  <a
                    className="mt-5 inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-extrabold text-sky-700 hover:bg-sky-50"
                    href={pkg.location.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Google Maps
                  </a>
                )}
              </section>
            )}

            {show.faq && (
              <section className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">FAQ</h2>
                <div className="mt-6 space-y-3">
                  {faqItems.map((item) => (
                    <details
                      key={item.question}
                      className="group rounded-2xl border border-black/5 bg-slate-50 px-5 py-4"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                        <span className="text-sm font-black text-slate-900">{item.question}</span>
                        <span className="text-slate-500 transition-transform group-open:rotate-180">⌄</span>
                      </summary>
                      {item.answer && (
                        <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
                      )}
                    </details>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Package Details</h2>

              {(pkg.basic?.tags || []).length > 0 && (
                <>
                  <h3 className="mt-7 text-sm font-extrabold uppercase tracking-wider text-slate-600">
                    Tags
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {pkg.basic.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-black/5 bg-slate-50 px-4 py-2 text-sm font-extrabold text-slate-900"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-28 h-fit">
            <PricingSidebarSync
              packageId={pkg._id}
              packageName={pkg.basic?.name}
              packageData={pkg}
              bestDeal={pkg.bestDeal}
              pricing={pkg.pricing}
              whatsapp={whatsapp}
              callNumber={pkg.cta?.call}
              cancellationPolicy={pkg.policies?.cancellation}
              refundPolicy={pkg.policies?.refund}
              availability={pkg.availability}
              pricingOptions={pkg.pricingOptions}
            />
          </aside>
        </div>

        <PackageSuggestionsSection
          excludeId={pkg._id}
          title="You may also like"
          subtitle="More packages picked for your next journey"
          limit={6}
        />
      </div>
    </div>
  );
}
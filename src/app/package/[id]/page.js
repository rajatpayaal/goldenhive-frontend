import { apiService } from "../../../services/api.service";
import Link from "next/link";
import { PackageAddToCart } from "../../../components/PackageAddToCart";
import { PackageSuggestionsSection } from "../../../components/PackageSuggestionsSection";
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

      <div
        className="relative overflow-hidden rounded-b-[28px] shadow-[0_18px_45px_rgba(2,6,23,0.12)]"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-slate-950/15" />
        <div className="relative">
          <div className="container">
            <div className="min-h-[420px] h-[62vh] flex flex-col justify-end pb-14 pt-24 text-white">
              <Link
                href={backHref}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/15"
              >
                <span aria-hidden="true">←</span> Back
              </Link>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-extrabold backdrop-blur">
                  {pkg.basic?.durationDays}D / {pkg.basic?.nights}N
                </span>
                {pkg.categoryId?.name && (
                  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
                    {pkg.categoryId.name}
                  </span>
                )}
                {pkg.basic?.destination && (
                  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
                    {pkg.basic.destination}
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                {pkg.hero?.title || pkg.basic?.name}
              </h1>
              <p className="mt-3 max-w-3xl text-base text-white/90 sm:text-lg">
                {pkg.hero?.subtitle || pkg.basic?.tagline}
              </p>

              {(pkg.hero?.badges || []).length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2" aria-label="Highlights badges">
                  {pkg.hero.badges.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-extrabold backdrop-blur"
                    >
                      {badge}
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
              <section className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm">
                <div className="flex items-end justify-between gap-4">
                  <h2 className="text-xl font-black tracking-tight text-slate-900">Quick Info</h2>
                  <span className="text-sm font-semibold text-slate-500">At a glance</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {quickInfoEntries.map(([key, value]) => (
                    <div key={key} className="rounded-2xl border border-black/5 bg-slate-50 p-4">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        {toLabel(key)}
                      </div>
                      <div className="mt-1 text-sm font-extrabold text-slate-900">
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

            {show.highlights && (
              <section className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Highlights</h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {pkg.highlights.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center rounded-full border border-black/5 bg-slate-50 px-4 py-2 text-sm font-extrabold text-slate-900"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {show.whyChooseUs && (
              <section className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Why Choose This</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {pkg.whyChooseUs.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-black/5 bg-slate-50 p-4"
                    >
                      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700">
                        ✓
                      </span>
                      <div className="text-sm font-bold text-slate-800">{item}</div>
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
              <section className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Gallery</h2>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {gallery.map((img, i) => (
                    <div
                      key={img.url || i}
                      className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/5 bg-slate-100"
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                        style={{ backgroundImage: `url(${img.url})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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
            <div className="rounded-3xl border border-black/5 bg-white p-7 shadow-[0_18px_45px_rgba(2,6,23,0.08)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
                    Book this Package
                  </div>
                  <div className="mt-2 text-lg font-black text-slate-900">
                    {pkg.basic?.name}
                  </div>
                </div>
                {pkg.pricing?.discountPercent > 0 && (
                  <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-extrabold text-emerald-700">
                    Save {pkg.pricing.discountPercent}%
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-black/5 bg-slate-50 p-5">
                <div className="flex flex-wrap items-end gap-3">
                  {pkg.pricing?.basePrice > 0 && pkg.pricing.discountPercent > 0 && (
                    <div className="text-sm font-bold text-slate-400 line-through">
                      ₹{pkg.pricing.basePrice}
                    </div>
                  )}
                  <div className="text-4xl font-black tracking-tight text-slate-900">
                    ₹{pkg.pricing?.finalPrice || pkg.basic?.finalPrice || "TBA"}
                  </div>
                  <div className="pb-1 text-sm font-bold text-slate-500">/ person</div>
                </div>
                <div className="mt-3 text-xs font-semibold text-slate-500">
                  {pkg.pricing?.taxesIncluded ? "Includes all taxes and fees." : "Taxes not included."}
                </div>
              </div>

              {pkg.availability?.seatsLeft > 0 && (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-800">
                  Only {pkg.availability.seatsLeft} seats remaining.
                </div>
              )}

              <div className="mt-6 grid gap-3">
                <PackageAddToCart 
                  packageId={pkg._id} 
                  packageName={pkg.basic?.name}
                  packageData={pkg}
                />
                <a
                  href={`https://wa.me/${whatsapp}`}
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-4 text-base font-black text-white shadow-[0_14px_30px_rgba(16,185,129,0.35)] hover:bg-emerald-600"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chat on WhatsApp
                </a>
                <a
                  href={`tel:${pkg.cta?.call}`}
                  className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-4 text-base font-black text-slate-900 hover:bg-slate-50"
                >
                  Call Now
                </a>
              </div>

              {(pkg.policies?.cancellation || pkg.policies?.refund) && (
                <div className="mt-6 space-y-2 border-t border-black/5 pt-5 text-sm font-semibold text-slate-700">
                  {pkg.policies?.cancellation && <p>✅ {pkg.policies.cancellation}</p>}
                  {pkg.policies?.refund && <p>💳 {pkg.policies.refund}</p>}
                </div>
              )}
            </div>
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

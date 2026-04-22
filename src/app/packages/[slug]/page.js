import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  CarFront,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Hotel,
  Languages,
  MapPinned,
  Mountain,
  ShieldCheck,
  Sparkles,
  Star,
  UtensilsCrossed,
  Users,
} from "lucide-react";

import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { PackageSuggestionsSection } from "../../../components/PackageSuggestionsSection";
import { PricingOptionsSelector } from "../../../components/PricingOptionsSelector";
import { PricingSidebarSync } from "../../../components/PricingSidebarSync";
import { apiService } from "../../../services/api.service";

async function resolvePackageId(slugOrId) {
  const decoded = decodeURIComponent(slugOrId || "");
  if (/^[0-9a-fA-F]{24}$/.test(decoded)) return decoded;

  const directPackage = await apiService.getPackageBySlug(decoded, { dynamic: false });
  if (directPackage?._id) return directPackage._id;

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

  const bySlugQuery = await trySearch(decoded);
  if (bySlugQuery) return bySlugQuery;

  const byNameQuery = await trySearch(decoded.replace(/-/g, " "));
  if (byNameQuery) return byNameQuery;

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

const normalizeValue = (value) => {
  if (value == null) return "";
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean).join(", ");
  }

  const text = cleanText(value);
  if (!text || text === "[]" || text === "{}") return "";

  if ((text.startsWith("[") && text.endsWith("]")) || (text.startsWith("{") && text.endsWith("}"))) {
    try {
      const parsed = JSON.parse(text);
      return normalizeValue(parsed);
    } catch {
      return text;
    }
  }

  return text;
};

const normalizeList = (items = []) => {
  return (Array.isArray(items) ? items : [items])
    .flatMap((item) => {
      const normalized = normalizeValue(item);
      if (!normalized) return [];
      return normalized
        .split(/\r?\n|•|\u2022/)
        .map((part) => part.trim())
        .filter(Boolean);
    })
    .filter(Boolean);
};

const toLabel = (key) => {
  return String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatInr = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return "TBA";
  return numeric.toLocaleString("en-IN");
};

const getHeroImage = (pkg) => {
  return pkg.images?.primary?.url || pkg.images?.gallery?.[0]?.url || "/placeholder.svg";
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
      return {
        question: cleanText(question || "FAQ"),
        answer: normalizeValue(answer || ""),
      };
    })
    .filter(Boolean);
};

function getInfoIcon(key) {
  const iconClass = "h-4 w-4";
  const mapping = {
    pickup: <MapPinned className={iconClass} />,
    drop: <MapPinned className={iconClass} />,
    meals: <UtensilsCrossed className={iconClass} />,
    stay: <Hotel className={iconClass} />,
    transport: <CarFront className={iconClass} />,
    difficulty: <Mountain className={iconClass} />,
    timing: <Clock3 className={iconClass} />,
    duration: <CalendarDays className={iconClass} />,
    bestTime: <Sparkles className={iconClass} />,
    groupSize: <Users className={iconClass} />,
    language: <Languages className={iconClass} />,
    guide: <ShieldCheck className={iconClass} />,
  };
  return mapping[key] || <Sparkles className={iconClass} />;
}

function SectionShell({ title, subtitle, children, className = "" }) {
  return (
    <section
      className={[
        "rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] p-6 shadow-[0_18px_45px_rgba(121,68,44,0.10)] sm:p-8",
        className,
      ].join(" ")}
    >
      <div className="mb-6">
        <h2 className="text-3xl font-black tracking-tight text-[color:var(--gh-heading)]">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm font-semibold text-[color:var(--gh-text-soft)]">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

async function getPackageByRouteParam(slugOrId) {
  const decoded = decodeURIComponent(slugOrId || "");
  const directPackage = await apiService.getPackageBySlug(decoded, { dynamic: false });
  const resolvedId = directPackage?._id || (await resolvePackageId(decoded));
  return directPackage || (resolvedId ? await apiService.getPackageById(resolvedId) : null);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const pkg = await getPackageByRouteParam(slug);

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

  const canonicalPath = `/packages/${pkg.basic?.slug || pkg._id}`;
  const primaryImage = pkg.images?.primary?.url;
  const galleryImages = (pkg.images?.gallery || []).map((img) => img?.url).filter(Boolean);
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

export default async function PackagesSlugPage({ params }) {
  const { slug } = await params;
  const pkg = await getPackageByRouteParam(slug);

  if (!pkg) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center px-5 py-24 text-center">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Package not found or inactive.</h2>
        <p className="mt-2 text-sm font-semibold text-slate-600">
          Try going back to the homepage and selecting another package.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(90deg,var(--gh-accent),var(--gh-accent-strong))] px-6 py-4 text-sm font-black text-white"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const heroImage = getHeroImage(pkg);
  const gallery = (pkg.images?.gallery || []).filter((item) => item?.url);
  const whatsapp = (pkg.cta?.whatsapp || "").replace("+", "");
  const backHref = pkg.categoryId?.slug ? `/${pkg.categoryId.slug}` : "/tour-packages";
  const quickInfoEntries = Object.entries(pkg.quickInfo || {})
    .map(([key, value]) => [key, normalizeValue(value)])
    .filter(([, value]) => Boolean(value));
  const travelInfoEntries = Object.entries(pkg.travelInfo || {})
    .map(([key, value]) => [key, normalizeValue(value)])
    .filter(([, value]) => Boolean(value));
  const policyEntries = Object.entries(pkg.policies || {})
    .map(([key, value]) => [key, normalizeValue(value)])
    .filter(([, value]) => Boolean(value));
  const highlightItems = normalizeList(pkg.highlights);
  const whyChooseUsItems = normalizeList(pkg.whyChooseUs);
  const inclusions = normalizeList(pkg.inclusions);
  const exclusions = normalizeList(pkg.exclusions);
  const faqItems = getFaqItems(pkg);
  const tags = normalizeList(pkg.basic?.tags);
  const overviewText = normalizeValue(pkg.overview?.long || pkg.overview?.short || pkg.basic?.tagline);
  const pickup = normalizeValue(pkg.quickInfo?.pickup);
  const drop = normalizeValue(pkg.quickInfo?.drop);
  const meals = normalizeValue(pkg.quickInfo?.meals);
  const stay = normalizeValue(pkg.quickInfo?.stay);
  const difficulty = normalizeValue(pkg.quickInfo?.difficulty);
  const bestTime = normalizeValue(pkg.quickInfo?.bestTime || pkg.travelInfo?.bestTime);
  const language = normalizeValue(pkg.quickInfo?.language);

  const visible = pkg.visibility || {};
  const show = {
    quickInfo: visible.quickInfo !== false && quickInfoEntries.length > 0,
    overview: visible.overview !== false && Boolean(overviewText),
    highlights: visible.highlights !== false && highlightItems.length > 0,
    whyChooseUs: visible.whyChooseUs !== false && whyChooseUsItems.length > 0,
    inclusions: (visible.inclusions !== false && inclusions.length > 0) || (visible.exclusions !== false && exclusions.length > 0),
    itinerary: visible.itinerary !== false && (pkg.itinerary || []).length > 0,
    gallery: visible.gallery !== false && gallery.length > 0,
    travelPolicies: travelInfoEntries.length > 0 || policyEntries.length > 0,
    location: Boolean(pkg.location?.address || pkg.location?.mapUrl),
    faq: visible.faq !== false && faqItems.length > 0,
    tags: tags.length > 0,
  };

  return (
    <div className="pb-20 pt-6">
      <div className="mx-auto px-4 sm:px-5 lg:px-6">
        <div className="rounded-[1.6rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.72)] px-4 py-3 backdrop-blur sm:px-5">
          <Breadcrumbs
            items={[
              { href: backHref, label: pkg.categoryId?.name || "Tour Packages" },
              { href: `/packages/${pkg.basic?.slug || pkg._id}`, label: pkg.basic?.name || "Package Details" },
            ]}
          />
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="relative overflow-hidden rounded-[2.2rem] border border-[color:var(--gh-border)] shadow-[0_28px_70px_rgba(121,68,44,0.16)]">
            <div className="relative">
              <Image
                src={heroImage}
                alt={pkg.images?.primary?.alt || pkg.basic?.name || "Package image"}
                fill
                priority
                className="object-cover"
              />
                {show.overview && (
              <SectionShell title="Overview" subtitle="A warm look at the journey ahead">
                <div className="rounded-[1.6rem] border border-[color:var(--gh-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,242,231,0.78))] p-5">
                  <div className="flex gap-4">
                    <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--gh-accent),var(--gh-accent-strong))] text-white sm:inline-flex">
                      <Mountain className="h-5 w-5" />
                    </div>
                    <p className="text-[15px] font-medium leading-8 text-[color:var(--gh-text)]">{overviewText}</p>
                  </div>
                </div>
              </SectionShell>
            )}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,19,40,0.96)_0%,rgba(42,21,69,0.82)_38%,rgba(52,31,78,0.42)_62%,rgba(17,24,39,0.18)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,79,138,0.26),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(255,185,94,0.22),transparent_22%)]" />

              <div className="relative flex min-h-[560px] flex-col justify-between p-6 text-white sm:p-8 lg:p-10">
                <div className="flex justify-start">
                </div>

                <div className="max-w-3xl">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-black text-white shadow-[0_10px_25px_rgba(16,185,129,0.25)]">
                      <Star className="h-3.5 w-3.5 fill-white text-white" />
                      4.8 ({pkg.reviews?.length || 120})
                    </span>
                    <span className="inline-flex items-center rounded-full bg-[rgba(124,58,237,0.9)] px-3 py-1.5 text-xs font-black text-white">
                      {pkg.categoryId?.name || "Tour Package"}
                    </span>
                    {pkg.basic?.destination ? (
                      <span className="inline-flex items-center rounded-full bg-[rgba(99,102,241,0.9)] px-3 py-1.5 text-xs font-black text-white">
                        {pkg.basic.destination}
                      </span>
                    ) : null}
                  </div>

                  <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[0.96] tracking-tight text-white drop-shadow-[0_8px_22px_rgba(0,0,0,0.35)] sm:text-5xl lg:text-[4.2rem]">
                    {pkg.hero?.title || pkg.basic?.name}
                  </h1>
                  <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-white/86 sm:text-lg">
                    {pkg.hero?.subtitle || pkg.basic?.tagline}
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold text-white/95">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-[rgba(9,14,29,0.4)] px-4 py-2.5 backdrop-blur">
                      <ShieldCheck className="h-4 w-4 text-[color:var(--gh-accent-strong)]" />
                      Verified drivers and secure support
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-[rgba(9,14,29,0.4)] px-4 py-2.5 backdrop-blur">
                      <Users className="h-4 w-4 text-[color:var(--gh-accent-strong)]" />
                      Family-friendly itinerary
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-[rgba(9,14,29,0.4)] px-4 py-2.5 backdrop-blur">
                      <Sparkles className="h-4 w-4 text-[color:var(--gh-accent-strong)]" />
                      Premium stays and local guidance
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start">
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

        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            {show.quickInfo && (
              <SectionShell title="Quick Info" subtitle="Everything at a glance">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {quickInfoEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-[1.4rem] border border-[color:var(--gh-border)] bg-white px-4 py-4 shadow-[0_8px_20px_rgba(121,68,44,0.05)]"
                    >
                      <div className="flex items-center gap-2 text-[color:var(--gh-accent)]">
                        {getInfoIcon(key)}
                        <span className="text-[11px] font-black uppercase tracking-[0.22em]">
                          {toLabel(key)}
                        </span>
                      </div>
                      <div className="mt-3 text-sm font-black leading-6 text-[color:var(--gh-heading)]">{value}</div>
                    </div>
                  ))}
                </div>
              </SectionShell>
            )}


            {(pkg.pricingOptions || []).length > 0 && (
              <PricingOptionsSelector
                packageId={pkg._id}
                packageName={pkg.basic?.name}
                pricingOptions={pkg.pricingOptions}
              />
            )}

            {(show.highlights || show.whyChooseUs) && (
              <div className="grid gap-6 xl:grid-cols-2">
                {show.highlights && (
                  <SectionShell title="Highlights" subtitle="What makes this special" className="h-full">
                    <div className="space-y-3">
                      {highlightItems.map((item) => (
                        <div
                          key={item}
                          className="flex items-start gap-3 rounded-[1.3rem] border border-emerald-200 bg-[linear-gradient(135deg,rgba(17,185,129,0.10),rgba(255,255,255,0.88))] px-4 py-3"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <span className="text-sm font-bold leading-6 text-[color:var(--gh-heading)]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </SectionShell>
                )}

                {show.whyChooseUs && (
                  <SectionShell title="Why Choose This" subtitle="Reasons to pick us" className="h-full">
                    <div className="space-y-3">
                      {whyChooseUsItems.map((item, idx) => (
                        <div
                          key={`${idx}-${item}`}
                          className="flex items-start gap-4 rounded-[1.3rem] border border-[color:var(--gh-border)] bg-white px-4 py-4"
                        >
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--gh-accent),var(--gh-accent-strong))] text-sm font-black text-white">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-bold leading-6 text-[color:var(--gh-heading)]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </SectionShell>
                )}
              </div>
            )}

            {show.itinerary && (
              <SectionShell title="Inclusions" subtitle="Your day-by-day journey">
                <div className="relative space-y-4 pl-5 before:absolute before:left-2 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-[linear-gradient(var(--gh-accent),rgba(255,185,94,0.3))]">
                  {pkg.itinerary.map((dayItem, index) => (
                    <div key={dayItem.day ?? dayItem.title} className="relative">
                      <span className="absolute -left-[1.1rem] top-7 inline-flex h-4 w-4 rounded-full border-4 border-white bg-[color:var(--gh-accent)] shadow-sm" />
                      <div className="rounded-[1.5rem] border border-[color:var(--gh-border)] bg-white p-5 shadow-[0_10px_25px_rgba(121,68,44,0.05)]">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="max-w-2xl">
                            <div className="inline-flex rounded-full bg-[color:var(--gh-accent-soft)] px-3 py-1 text-xs font-black text-[color:var(--gh-accent)]">
                              Day {dayItem.day ?? index + 1}
                            </div>
                            <h3 className="mt-3 text-xl font-black text-[color:var(--gh-heading)]">
                              {dayItem.title}
                            </h3>
                            {dayItem.description ? (
                              <p className="mt-3 text-sm font-medium leading-7 text-[color:var(--gh-text-soft)]">
                                {normalizeValue(dayItem.description)}
                              </p>
                            ) : null}
                          </div>

                          <div className="grid gap-3 text-sm font-semibold text-[color:var(--gh-text-soft)] sm:min-w-[240px]">
                            {dayItem.meals ? (
                              <div className="rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-3">
                                <span className="font-black text-[color:var(--gh-heading)]">Meals:</span>{" "}
                                {normalizeValue(dayItem.meals)}
                              </div>
                            ) : null}
                            {dayItem.stay ? (
                              <div className="rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-3">
                                <span className="font-black text-[color:var(--gh-heading)]">Stay:</span>{" "}
                                {normalizeValue(dayItem.stay)}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionShell>
            )}

            {show.inclusions && (
              <SectionShell title="Inclusions & Exclusions" subtitle="Clear scope before you book">
                <div className="grid gap-6 xl:grid-cols-2">
                  <div className="rounded-[1.6rem] border border-[color:var(--gh-border)] bg-white p-5">
                    <div className="text-xs font-black uppercase tracking-[0.26em] text-emerald-600">Inclusions</div>
                    {inclusions.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {inclusions.map((item) => (
                          <div key={item} className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            <span className="text-sm font-semibold leading-6 text-[color:var(--gh-heading)]">{item}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm font-semibold text-[color:var(--gh-text-soft)]">Not specified.</p>
                    )}
                  </div>

                  <div className="rounded-[1.6rem] border border-[color:var(--gh-border)] bg-white p-5">
                    <div className="text-xs font-black uppercase tracking-[0.26em] text-rose-600">Exclusions</div>
                    {exclusions.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {exclusions.map((item) => (
                          <div key={item} className="flex items-start gap-3">
                            <span className="mt-1 inline-flex h-4 w-4 shrink-0 rounded-full bg-rose-100" />
                            <span className="text-sm font-semibold leading-6 text-[color:var(--gh-heading)]">{item}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm font-semibold text-[color:var(--gh-text-soft)]">Not specified.</p>
                    )}
                  </div>
                </div>
              </SectionShell>
            )}

            {show.gallery && (
              <SectionShell title="Gallery" subtitle="Your day-by-day journey">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  {gallery.map((img, i) => (
                    <div
                      key={img.url || i}
                      className="group relative aspect-[1.15/1] overflow-hidden rounded-[1.4rem] border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)]"
                    >
                      <Image
                        src={img.url}
                        alt={img.alt || `Package image ${i + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                        sizes="(min-width: 1280px) 16vw, (min-width: 640px) 33vw, 100vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(17,24,39,0.58)] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                  ))}
                </div>
              </SectionShell>
            )}

            {show.faq && (
              <SectionShell title="FAQ" subtitle="Answers before your journey starts">
                <div className="space-y-3">
                  {faqItems.map((item) => (
                    <details
                      key={item.question}
                      className="group rounded-[1.4rem] border border-[color:var(--gh-border)] bg-white px-5 py-4"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                        <span className="text-sm font-black text-[color:var(--gh-heading)]">{item.question}</span>
                        <span className="text-[color:var(--gh-accent)] transition-transform group-open:rotate-90">
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </summary>
                      {item.answer ? (
                        <p className="mt-3 text-sm font-medium leading-7 text-[color:var(--gh-text-soft)]">
                          {item.answer}
                        </p>
                      ) : null}
                    </details>
                  ))}
                </div>
              </SectionShell>
            )}

            {show.travelPolicies && (
              <SectionShell title="Travel & Policies" subtitle="Useful trip information">
                <div className="grid gap-6 xl:grid-cols-2">
                  {travelInfoEntries.length > 0 ? (
                    <div className="rounded-[1.6rem] border border-[color:var(--gh-border)] bg-white p-5">
                      <div className="text-xs font-black uppercase tracking-[0.26em] text-[color:var(--gh-accent)]">
                        Travel Info
                      </div>
                      <div className="mt-4 space-y-3">
                        {travelInfoEntries.map(([key, value]) => (
                          <div key={key} className="flex items-start justify-between gap-4 text-sm">
                            <span className="font-semibold text-[color:var(--gh-text-soft)]">{toLabel(key)}</span>
                            <span className="max-w-[58%] text-right font-black text-[color:var(--gh-heading)]">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {policyEntries.length > 0 ? (
                    <div className="rounded-[1.6rem] border border-[color:var(--gh-border)] bg-white p-5">
                      <div className="text-xs font-black uppercase tracking-[0.26em] text-[color:var(--gh-accent)]">
                        Policies
                      </div>
                      <div className="mt-4 space-y-3">
                        {policyEntries.map(([key, value]) => (
                          <div key={key} className="flex items-start justify-between gap-4 text-sm">
                            <span className="font-semibold text-[color:var(--gh-text-soft)]">{toLabel(key)}</span>
                            <span className="max-w-[58%] text-right font-black text-[color:var(--gh-heading)]">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </SectionShell>
            )}

            {(show.location || show.tags) && (
              <div className="grid gap-6 xl:grid-cols-2">
                {show.location && (
                  <SectionShell title="Location" subtitle={pkg.location?.address || "Pickup and route region"} className="h-full">
                    <div className="overflow-hidden rounded-[1.4rem] border border-[color:var(--gh-border)] bg-[linear-gradient(135deg,rgba(255,79,138,0.08),rgba(255,185,94,0.12))]">
                      <div className="flex min-h-[120px] items-end bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_38%),linear-gradient(135deg,rgba(124,58,237,0.16),rgba(255,185,94,0.18))] p-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-[color:var(--gh-heading)]">
                          <MapPinned className="h-3.5 w-3.5 text-[color:var(--gh-accent)]" />
                          {pkg.cityId?.name || "Travel Route"}
                        </div>
                      </div>
                    </div>
                    {pkg.location?.mapUrl ? (
                      <a
                        href={pkg.location.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,var(--gh-accent),var(--gh-accent-strong))] px-5 py-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(255,79,138,0.22)]"
                      >
                        Open in Google Maps
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    ) : null}
                  </SectionShell>
                )}

                {show.tags && (
                  <SectionShell title="Package Details" subtitle="Search-friendly highlights" className="h-full">
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-3 py-2 text-xs font-black text-[color:var(--gh-heading)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </SectionShell>
                )}
              </div>
            )}

            <SectionShell title="Need Help?" subtitle="Our travel experts are here for you">
              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#16a34a] px-5 py-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(22,163,74,0.22)]"
                >
                  Chat on WhatsApp
                </a>
                <a
                  href={`tel:${pkg.cta?.call}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--gh-border)] bg-white px-5 py-4 text-sm font-black text-[color:var(--gh-heading)]"
                >
                  Call {pkg.cta?.call || "our support team"}
                </a>
              </div>
            </SectionShell>
          </div>

          <div className="hidden lg:block" />
        </div>

        <div className="mt-8">
          <PackageSuggestionsSection
            excludeId={pkg._id}
            title="Travelers also booked"
            subtitle="More packages picked for your next journey"
            limit={6}
          />
        </div>
      </div>
    </div>
  );
}

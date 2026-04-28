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
      categoryId: category._id,
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
  const iconClass = "h-4 w-4 shrink-0";
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
  return <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-gh-rose">{mapping[key] || <Sparkles className={iconClass} />}</div>;
}

function SectionShell({ title, subtitle, children, className = "" }) {
  return (
    <section
      className={[
        "rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] p-6 shadow-[0_18px_45px_rgba(121,68,44,0.10)] sm:p-8",
        className,
      ].join(" ")}
    >
      <div className="mb-4">
        <h2 className="text-lg font-black tracking-tight text-[color:var(--gh-heading)]">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-xs font-semibold text-[color:var(--gh-text-soft)]">{subtitle}</p>
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
    <div className="pb-20 pt-0 sm:pt-6">
      <div className="mx-auto sm:px-5 lg:px-6">
        <div className="hidden sm:block rounded-[1.6rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.72)] px-4 py-3 backdrop-blur sm:px-5">
          <Breadcrumbs
            items={[
              { href: backHref, label: pkg.categoryId?.name || "Tour Packages" },
              { href: `/packages/${pkg.basic?.slug || pkg._id}`, label: pkg.basic?.name || "Package Details" },
            ]}
          />
        </div>

        <div className="mt-0 sm:mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="relative overflow-hidden sm:rounded-[2.2rem] border-b sm:border border-[color:var(--gh-border)] shadow-[0_28px_70px_rgba(121,68,44,0.16)] -mx-4 sm:mx-0">
            <div className="relative">
              <Image
                src={heroImage}
                alt={pkg.images?.primary?.alt || pkg.basic?.name || "Package image"}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="relative flex min-h-[400px] flex-col justify-end p-5 text-white sm:min-h-[560px] sm:p-8 lg:p-10 pb-16">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white">
                      {pkg.categoryId?.name || "Char Dham Yatra"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-purple-500 px-2.5 py-1 text-[10px] font-bold text-white">
                      Spiritual
                    </span>
                    <span className="inline-flex items-center rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white">
                      2026 Season
                    </span>
                  </div>

                  <h1 className="mt-3 max-w-3xl text-2xl font-black leading-tight text-white sm:text-5xl lg:text-[4.2rem]">
                    {pkg.hero?.title || pkg.basic?.name}
                  </h1>
                  <p className="mt-2 max-w-2xl text-xs font-medium leading-relaxed text-slate-200 sm:text-lg">
                    {pkg.hero?.subtitle || pkg.basic?.tagline || "A divine journey to the sacred source of Yamuna & Ganga"}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] font-semibold text-white/90">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>{pkg.basic?.durationDays || 6} Days / {pkg.basic?.nights || 5} Nights</span>
                    </div>
                    <div className="w-px h-3 bg-white/30" />
                    <div className="flex items-center gap-1.5">
                      <MapPinned className="h-3.5 w-3.5" />
                      <span>Ex- {pkg.basic?.destination || "Haridwar"}</span>
                    </div>
                    <div className="w-full sm:w-auto mt-1 sm:mt-0 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>Group Size: {pkg.quickInfo?.groupSize || "2-12 People"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="relative z-10 -mt-12 mx-4 sm:mx-0 sm:mt-0 lg:sticky lg:top-24 lg:self-start">
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

        <div className="mt-7 grid items-start gap-6 mx-4 sm:mx-0 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
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

            {show.quickInfo && (
              <SectionShell title="Quick Info" subtitle="Everything at a glance">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {quickInfoEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center gap-3 rounded-2xl border border-[color:var(--gh-border)] bg-white p-3 shadow-sm"
                    >
                      {getInfoIcon(key)}
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                          {toLabel(key)}
                        </span>
                        <div className="text-[11px] font-black leading-tight text-slate-800">{value}</div>
                      </div>
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
              <div className="grid grid-cols-2 gap-4 xl:gap-6">
                {show.highlights && (
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-sm font-black text-slate-800">Highlights</h3>
                    <div className="space-y-2">
                      {highlightItems.slice(0, 5).map((item) => (
                        <div key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          <span className="text-[10px] font-semibold leading-tight text-slate-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {show.whyChooseUs && (
                  <div className="flex flex-col space-y-2 border-l border-black/5 pl-4">
                    <h3 className="text-sm font-black text-slate-800">Why Choose Us</h3>
                    <div className="space-y-2">
                      {whyChooseUsItems.slice(0, 5).map((item, idx) => (
                        <div key={`${idx}-${item}`} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gh-rose" />
                          <span className="text-[10px] font-semibold leading-tight text-slate-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {show.itinerary && (
              <div className="flex flex-col">
                <div className="mb-4">
                  <h2 className="text-lg font-black tracking-tight text-slate-800">Itinerary Overview</h2>
                  <p className="text-xs font-semibold text-slate-500">6 Days / 5 Nights</p>
                </div>
                <div className="space-y-2">
                  {pkg.itinerary.map((dayItem, index) => (
                    <details key={dayItem.day ?? dayItem.title} className="group rounded-xl border border-black/5 bg-white px-4 py-3 shadow-sm">
                      <summary className="flex cursor-pointer list-none items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-black text-gh-rose">Day {dayItem.day ?? index + 1}</span>
                          <span className="text-xs font-bold text-slate-800">{dayItem.title}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-90" />
                      </summary>
                      {dayItem.description ? (
                        <p className="mt-3 text-[11px] font-medium leading-relaxed text-slate-600 pl-11">
                          {normalizeValue(dayItem.description)}
                        </p>
                      ) : null}
                    </details>
                  ))}
                </div>
                <button className="mt-4 w-full rounded-xl bg-rose-50 py-3 text-xs font-bold text-gh-rose transition hover:bg-rose-100">
                  View Full Itinerary
                </button>
              </div>
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

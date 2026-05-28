import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiService } from "../../../services/api.service";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { sanitizeHtmlContent } from "../../../lib/sanitize";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const policies = await apiService.getPolicies();
  const policyData = policies.find(policy => policy.slug === slug);

  if (!policyData) {
    return {
      title: "Policy Not Found",
    };
  }

  const policy = await apiService.getPolicyById(policyData._id);

  if (!policy) {
    return {
      title: "Policy Not Found",
    };
  }

  return {
    title: policy.seo?.metaTitle || policy.title,
    description: policy.seo?.metaDescription || policy.content?.substring(0, 160),
    keywords: policy.seo?.keywords?.join(", "),
    alternates: { canonical: `/policies/${policy.slug || slug}` },
    openGraph: {
      title: policy.seo?.metaTitle || policy.title,
      description: policy.seo?.metaDescription || policy.content?.substring(0, 160),
      type: "article",
      siteName: "GoldenHive Holidays",
      url: `/policies/${policy.slug || slug}`,
      images: policy.seo?.ogImage ? [{ url: policy.seo.ogImage }] : [],
    },
    twitter: {
      card: policy.seo?.ogImage ? "summary_large_image" : "summary",
      title: policy.seo?.metaTitle || policy.title,
      description: policy.seo?.metaDescription || policy.content?.substring(0, 160),
      images: policy.seo?.ogImage ? [policy.seo.ogImage] : [],
    },
  };
}

export default async function PolicyDetailPage({ params }) {
  const { slug } = await params;
  const policies = await apiService.getPolicies();
  const policyData = policies.find(policy => policy.slug === slug);

  if (!policyData) {
    notFound();
  }

  const policy = await apiService.getPolicyById(policyData._id);

  if (!policy) {
    notFound();
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://goldenhiveholidays.in";
  const canonicalSlug = policy.slug || slug;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Policies",
        item: `${siteUrl}/policies`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: policy.title || "Policy",
        item: `${siteUrl}/policies/${canonicalSlug}`,
      },
    ],
  };

  return (
    <main className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-5 sm:py-12">
        <Breadcrumbs
          items={[
            { href: "/policies", label: "Policies" },
            { href: `/policies/${policy.slug}`, label: policy.title || "Policy" },
          ]}
        />

        {/* Header */}
        <div className="mb-6">
          <Link
            href="/policies"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] px-4 py-2 text-sm font-bold text-[color:var(--gh-heading)] hover:bg-[color:var(--gh-bg-soft)] transition-colors mb-5"
          >
            ← Back to Policies
          </Link>
          <div className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] px-6 py-7 shadow-[0_18px_45px_rgba(121,68,44,0.10)] sm:px-8">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">
              {policy.type.replace(/_/g, " ")}
            </p>
            <h1 className="mt-3 text-2xl font-black text-[color:var(--gh-heading)] sm:text-4xl">
              {policy.title}
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] px-6 py-8 shadow-[0_18px_45px_rgba(121,68,44,0.10)] sm:px-10">
            <div className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-[color:var(--gh-heading)] prose-p:text-[color:var(--gh-text)] prose-p:leading-relaxed prose-strong:text-[color:var(--gh-heading)] prose-a:text-[color:var(--gh-accent)]">
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(policy.content) }} />
            </div>
          </div>

          {/* Sections */}
          {policy.sections && policy.sections.length > 0 && (
            <div className="space-y-6">
              {policy.sections.map((section, index) => (
                <div key={index} className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] p-6 shadow-[0_18px_45px_rgba(121,68,44,0.10)] sm:p-8">
                  <h2 className="text-2xl font-black text-[color:var(--gh-heading)] mb-4">
                    {section.title}
                  </h2>

                  {section.description && (
                    <p className="text-[color:var(--gh-text)] mb-6 leading-relaxed font-medium">
                      {section.description}
                    </p>
                  )}

                  {section.imageUrl && (
                    <div className="mb-6">
                      <Image
                        src={section.imageUrl}
                        alt={section.title}
                        width={800}
                        height={400}
                        className="w-full rounded-2xl object-cover shadow-[0_8px_24px_rgba(121,68,44,0.10)]"
                      />
                    </div>
                  )}

                  {section.points && section.points.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {section.points.map((point, pointIndex) => (
                        <li key={pointIndex} className="flex items-start gap-3">
                          <span className="mt-1.5 h-2 w-2 rounded-full bg-[color:var(--gh-accent)] flex-shrink-0" />
                          <span className="text-[color:var(--gh-text)] font-medium">{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.subSections && section.subSections.length > 0 && (
                    <div className="space-y-4">
                      {section.subSections.map((subSection, subIndex) => (
                        <div key={subIndex} className="rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] p-4">
                          <h3 className="text-base font-black text-[color:var(--gh-heading)] mb-2">
                            {subSection.title}
                          </h3>
                          {subSection.description && (
                            <p className="text-[color:var(--gh-text-soft)] mb-3 text-sm font-medium">{subSection.description}</p>
                          )}
                          {subSection.points && subSection.points.length > 0 && (
                            <ul className="space-y-1">
                              {subSection.points.map((point, pointIndex) => (
                                <li key={pointIndex} className="flex items-start gap-2 text-sm">
                                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[color:var(--gh-accent-strong)] flex-shrink-0" />
                                  <span className="text-[color:var(--gh-text-soft)] font-medium">{point}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer Contact Info */}
          {policy.footer && (policy.footer.email || policy.footer.phone || policy.footer.address) && (
            <div className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] p-6 shadow-[0_18px_45px_rgba(121,68,44,0.10)] sm:p-8">
              <h2 className="text-xl font-black text-[color:var(--gh-heading)] mb-5">Contact Information</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {policy.footer.email && (
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[color:var(--gh-accent)]">Email</p>
                    <p className="mt-1 text-[color:var(--gh-heading)] font-semibold">{policy.footer.email}</p>
                  </div>
                )}
                {policy.footer.phone && (
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[color:var(--gh-accent)]">Phone</p>
                    <p className="mt-1 text-[color:var(--gh-heading)] font-semibold">{policy.footer.phone}</p>
                  </div>
                )}
                {policy.footer.address && (
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[color:var(--gh-accent)]">Address</p>
                    <p className="mt-1 text-[color:var(--gh-heading)] font-semibold">{policy.footer.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Back to Policies */}
          <div className="mt-4 text-center">
            <Link
              href="/policies"
              className="gh-primary-btn inline-flex items-center justify-center rounded-2xl px-7 py-3.5 text-sm font-black"
            >
              ← View All Policies
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiService } from "../../../services/api.service";
import { Breadcrumbs } from "../../../components/Breadcrumbs";

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
    openGraph: {
      title: policy.seo?.metaTitle || policy.title,
      description: policy.seo?.metaDescription || policy.content?.substring(0, 160),
      images: policy.seo?.ogImage ? [{ url: policy.seo.ogImage }] : [],
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

  return (
    <main className="bg-slate-50 pb-20">
      <div className="mx-auto max-w-4xl px-5 py-12">
        <Breadcrumbs
          items={[
            { href: "/policies", label: "Policies" },
            { href: `/policies/${policy.slug}`, label: policy.title || "Policy" },
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/policies"
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 mb-4"
          >
            ← Back to Policies
          </Link>
          <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
            {policy.title}
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-600 uppercase tracking-wide">
            {policy.type.replace(/_/g, " ")}
          </p>
        </div>

        {/* Main Content */}
        <div className="prose prose-slate max-w-none">
          <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
            <div className="prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-strong:text-slate-900 prose-strong:font-bold">
              <div dangerouslySetInnerHTML={{ __html: policy.content }} />
            </div>
          </div>
        </div>

        {/* Sections */}
        {policy.sections && policy.sections.length > 0 && (
          <div className="mt-12 space-y-8">
            {policy.sections.map((section, index) => (
              <div key={index} className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-4">
                  {section.title}
                </h2>

                {section.description && (
                  <p className="text-slate-700 mb-6 leading-relaxed">
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
                      className="w-full rounded-2xl object-cover"
                    />
                  </div>
                )}

                {section.points && section.points.length > 0 && (
                  <ul className="space-y-2 mb-6">
                    {section.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span className="text-slate-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.subSections && section.subSections.length > 0 && (
                  <div className="space-y-4">
                    {section.subSections.map((subSection, subIndex) => (
                      <div key={subIndex} className="rounded-2xl border border-black/5 bg-slate-50 p-4">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                          {subSection.title}
                        </h3>
                        {subSection.description && (
                          <p className="text-slate-700 mb-3">{subSection.description}</p>
                        )}
                        {subSection.points && subSection.points.length > 0 && (
                          <ul className="space-y-1">
                            {subSection.points.map((point, pointIndex) => (
                              <li key={pointIndex} className="flex items-start gap-2 text-sm">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                                <span className="text-slate-600">{point}</span>
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
          <div className="mt-12 rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6">Contact Information</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {policy.footer.email && (
                <div>
                  <p className="text-sm font-bold text-slate-600">Email</p>
                  <p className="text-slate-900">{policy.footer.email}</p>
                </div>
              )}
              {policy.footer.phone && (
                <div>
                  <p className="text-sm font-bold text-slate-600">Phone</p>
                  <p className="text-slate-900">{policy.footer.phone}</p>
                </div>
              )}
              {policy.footer.address && (
                <div>
                  <p className="text-sm font-bold text-slate-600">Address</p>
                  <p className="text-slate-900">{policy.footer.address}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back to Policies */}
        <div className="mt-12 text-center">
          <Link
            href="/policies"
            className="inline-flex rounded-2xl bg-emerald-500 px-6 py-3 text-white font-bold hover:bg-emerald-600"
          >
            View All Policies
          </Link>
        </div>
      </div>
    </main>
  );
}
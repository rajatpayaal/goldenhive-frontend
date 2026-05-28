import Link from "next/link";
import { apiService } from "../../services/api.service";

export const metadata = {
  title: "Policies | GoldenHive",
  description: "Read our policies including privacy policy, corporate tours policy, and fraud awareness.",
  keywords: ["policies", "privacy policy", "corporate tours", "fraud awareness"],
  alternates: { canonical: "/policies" },
  openGraph: {
    title: "Policies | GoldenHive",
    description: "Read our policies including privacy policy, corporate tours policy, and fraud awareness.",
    type: "website",
    siteName: "GoldenHive Holidays",
    url: "/policies",
    images: [{ url: "/logo-full.svg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Policies | GoldenHive",
    description: "Read our policies including privacy policy, corporate tours policy, and fraud awareness.",
    images: ["/logo-full.svg"],
  },
};

export default async function PoliciesPage() {
  const policies = await apiService.getPolicies();

  return (
    <main className="pb-20">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-5 sm:py-12">
        {/* Page Hero */}
        <div className="mb-10 rounded-2xl border border-[color:var(--gh-border)] bg-white px-6 py-8 shadow-gh-soft sm:px-10 sm:py-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">
            GoldenHive Holidays
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[color:var(--gh-heading)] sm:text-4xl lg:text-5xl">
            Policies
          </h1>
          <p className="mt-3 max-w-2xl text-base font-medium text-[color:var(--gh-text-soft)]">
            Important information about our policies and guidelines.
          </p>
        </div>

        {policies.length === 0 ? (
          <div className="rounded-2xl border border-[color:var(--gh-border)] bg-white py-16 text-center shadow-gh-soft">
            <p className="text-base font-semibold text-[color:var(--gh-text-soft)]">No policies available yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {policies.map((policy) => (
              <article
                key={policy._id}
                className="group overflow-hidden rounded-2xl border border-[color:var(--gh-border)] bg-white p-6 shadow-gh-soft transition hover:-translate-y-1 hover:shadow-gh-medium"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-black text-[color:var(--gh-heading)] group-hover:text-[color:var(--gh-accent)] transition-colors">
                    <Link href={`/policies/${policy.slug}`}>
                      {policy.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--gh-text-soft)]">
                    {policy.type.replace(/_/g, " ")}
                  </p>
                </div>

                <p className="line-clamp-3 text-sm font-medium text-[color:var(--gh-text-soft)]">
                  {policy.content}
                </p>

                <div className="mt-5 border-t border-[color:var(--gh-border)] pt-4">
                  <Link
                    href={`/policies/${policy.slug}`}
                    className="text-sm font-black text-[color:var(--gh-accent)] hover:opacity-80 transition-opacity"
                  >
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
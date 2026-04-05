import Link from "next/link";
import { apiService } from "../../services/api.service";

export const metadata = {
  title: "Policies | GoldenHive",
  description: "Read our policies including privacy policy, corporate tours policy, and fraud awareness.",
  keywords: ["policies", "privacy policy", "corporate tours", "fraud awareness"],
};

export default async function PoliciesPage() {
  const policies = await apiService.getPolicies();

  return (
    <main className="bg-slate-50 pb-20">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Policies
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Important information about our policies and guidelines.
          </p>
        </div>

        {policies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No policies available yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {policies.map((policy) => (
              <article
                key={policy._id}
                className="group overflow-hidden rounded-3xl border border-black/5 bg-white p-6 shadow-sm transition hover:shadow-lg"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition">
                    <Link href={`/policies/${policy.slug}`}>
                      {policy.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    {policy.type.replace(/_/g, " ")}
                  </p>
                </div>

                <p className="text-slate-600 line-clamp-3">
                  {policy.content}
                </p>

                <div className="mt-4">
                  <Link
                    href={`/policies/${policy.slug}`}
                    className="inline-flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700"
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
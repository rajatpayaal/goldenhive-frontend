import Link from "next/link";

export function CustomRequestCallout() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <div className="relative overflow-hidden rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.94)] p-8 shadow-[0_20px_55px_rgba(121,68,44,0.12)] sm:p-10">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute -top-12 right-0 h-80 w-80 rounded-full bg-[rgba(255,79,138,0.10)] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[rgba(255,185,94,0.14)] blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">
              <span className="h-2 w-2 rounded-full bg-[color:var(--gh-accent)]" />
              Custom Itinerary
            </p>
            <h2 className="text-4xl font-black leading-tight tracking-tight text-[color:var(--gh-heading)]">
              Need Something Unique?
            </h2>
            <p className="max-w-xl text-base font-medium leading-8 text-[color:var(--gh-text-soft)]">
              Share your dates, budget, and preferences. Our expert travel designers will create a bespoke plan tailored just for you.
            </p>
          </div>

          <Link
            href="/custom-requests"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(90deg,var(--gh-accent),var(--gh-accent-strong))] px-8 py-4 text-base font-black text-white shadow-[0_12px_30px_rgba(255,79,138,0.22)] transition hover:-translate-y-0.5"
          >
            <span>Create Custom Request</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

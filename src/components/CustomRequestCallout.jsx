import Link from "next/link";

export function CustomRequestCallout() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-col gap-6 rounded-3xl border border-black/10 bg-gradient-to-br from-slate-900 to-zinc-900 p-8 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-emerald-300">Custom itinerary</p>
          <h2 className="text-3xl font-black tracking-tight">Need something unique?</h2>
          <p className="text-sm text-slate-200">
            Share your dates, budget, and preferences in one place. Our travel designers will draft a bespoke plan and keep you updated throughout.
          </p>
        </div>
        <Link
          href="/custom-requests"
          className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
        >
          Open custom request
        </Link>
      </div>
    </section>
  );
}

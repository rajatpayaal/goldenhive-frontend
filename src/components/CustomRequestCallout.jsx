import Link from "next/link";

export function CustomRequestCallout() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <div className="group relative overflow-hidden rounded-3xl border-2 border-gradient-to-r from-emerald-400/30 to-sky-400/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-10 text-white shadow-2xl sm:flex-row">
        {/* Premium Gradient Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Custom Itinerary
            </p>
            <h2 className="text-4xl font-black tracking-tight leading-tight">
              Need Something Unique?
            </h2>
            <p className="max-w-xl text-base text-slate-200 leading-relaxed">
              Share your dates, budget, and preferences. Our expert travel designers will create a bespoke plan tailored just for you.
            </p>
          </div>
          <Link
            href="/custom-requests"
            className="group/btn inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-base font-black text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 whitespace-nowrap"
          >
            <span>Create Custom Request</span>
            <span className="transition-transform group-hover/btn:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

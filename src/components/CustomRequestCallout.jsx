import Link from "next/link";

export function CustomRequestCallout() {
  return (
    <section className="px-4 py-6 w-full">
      <div className="relative overflow-hidden rounded-[2rem] bg-rose-50/80 p-6 sm:p-10 flex flex-col items-start">
        <div className="relative z-10 w-full flex flex-row items-center justify-between">
          <div className="flex flex-col gap-2 w-2/3">
            <p className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest text-gh-rose">
              <span className="h-1.5 w-1.5 rounded-full bg-gh-rose" />
              Custom Itinerary
            </p>
            <h2 className="text-xl font-bold leading-tight tracking-tight text-slate-800">
              Need Something Unique?
            </h2>
            <p className="text-[11px] font-medium leading-relaxed text-slate-600 mb-2">
              Share your dates, budget, and preferences. Our expert designers will create a bespoke plan tailored just for you.
            </p>
            <Link
              href="/custom-requests"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gh-rose to-rose-400 px-4 py-2.5 text-[11px] font-bold text-white shadow-md transition hover:-translate-y-0.5 w-fit"
            >
              <span>Create Custom Request</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          
          <div className="w-1/3 flex justify-end">
            <svg viewBox="0 0 100 100" className="w-full max-w-[120px] drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 8C33.4 8 20 21.4 20 38C20 60.5 50 92 50 92C50 92 80 60.5 80 38C80 21.4 66.6 8 50 8Z" fill="#FF4F8A"/>
              <circle cx="50" cy="38" r="12" fill="white"/>
              <path d="M15 65L35 55L65 75L85 60V85L65 100L35 80L15 90V65Z" fill="#00C4CC"/>
              <path d="M35 55L65 75V100L35 80V55Z" fill="#FFC554"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

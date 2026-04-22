import CustomRequestFlow from "@/components/CustomRequestFlow";

export const metadata = {
  title: "Request a Custom Itinerary | GoldenHive",
  description: "Craft a personalized travel plan with our concierge team and track every custom request in one place.",
};

export default function CustomRequestsPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">
          Custom Request
        </p>
        <h1 className="text-5xl font-black text-[color:var(--gh-heading)]">Tell us what you really want to do</h1>
        <p className="max-w-2xl text-base font-medium text-[color:var(--gh-text-soft)]">
          Drop your query, dates, and budget in the form below. Access your history and even edit a request by ID if you or an agent need to revisit the plan.
        </p>
      </div>

      <div className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.98)] p-6 shadow-[0_18px_45px_rgba(121,68,44,0.12)] sm:p-8">
        <CustomRequestFlow />
      </div>
    </div>
  );
}

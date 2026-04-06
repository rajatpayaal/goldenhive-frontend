import CustomRequestFlow from "@/components/CustomRequestFlow";

export const metadata = {
  title: "Request a Custom Itinerary | GoldenHive",
  description: "Craft a personalized travel plan with our concierge team and track every custom request in one place.",
};

export default function CustomRequestsPage() {
  return (
    <div className="bg-slate-50 py-12">
      <div className="mx-auto max-w-6xl space-y-10 px-5">
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-emerald-500">Custom request</p>
          <h1 className="text-3xl font-black text-slate-900">Tell us what you really want to do</h1>
          <p className="text-sm text-slate-600">
            Drop your query, dates, and budget in the form below. Access your history and even edit a request by ID if you or an agent need to revisit the plan.
          </p>
        </div>

        <CustomRequestFlow />
      </div>
    </div>
  );
}

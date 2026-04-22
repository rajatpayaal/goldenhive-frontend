"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Loader from "./Loader";
import {
  createCustomRequestAction,
  getCustomRequestByIdAction,
  getMyCustomRequestsAction,
  updateCustomRequestAction,
} from "@/actions/customRequest.actions";

const DEFAULT_FORM = {
  query: "",
  destination: "",
  source: "web",
  startDate: "",
  endDate: "",
  travellers: 1,
  durationDays: 1,
  budget: 0,
  preferences: "",
  remarks: "",
};

const STATUS_OPTIONS = ["PENDING", "IN_REVIEW", "APPROVED", "COMPLETED", "REJECTED"];

const formatRequestTime = (request) => {
  const timestamp = request?.createdAt || request?.updatedAt;
  if (!timestamp) return "—";
  return new Date(timestamp).toLocaleString();
};

const normalizeList = (payload) => {
  const data = payload?.data ?? payload;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.data)) return data.data;
  return [];
};

const normalizeItem = (payload) => {
  if (!payload) return null;
  return payload?.data ?? payload;
};

export function CustomRequestFlow() {
  const { user, isLoading } = useAuth();
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState("");

  const [adminId, setAdminId] = useState("");
  const [adminRequest, setAdminRequest] = useState(null);
  const [adminStatus, setAdminStatus] = useState(STATUS_OPTIONS[0]);
  const [adminRemarks, setAdminRemarks] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const [adminError, setAdminError] = useState("");
  const isAdmin = String(user?.role || "").toUpperCase() === "ADMIN";

  useEffect(() => {
    const controller = new AbortController();
    const refresh = async () => {
      if (!user) {
        setRequests([]);
        setRequestsLoading(false);
        return;
      }
      setRequestsLoading(true);
      setRequestsError("");
      const result = await getMyCustomRequestsAction();
      if (controller.signal.aborted) return;
      setRequestsLoading(false);
      if (result.ok) {
        setRequests(normalizeList(result.data));
      } else {
        setRequestsError("Unable to load your requests right now.");
      }
    };

    refresh();
    return () => controller.abort();
  }, [user]);

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      setSubmitError("Please log in to create custom requests.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setSubmitMessage("");

    const payload = {
      ...formData,
      userId: user._id,
      travellers: Number(formData.travellers) || 1,
      budget: Number(formData.budget) || 0,
      durationDays: Number(formData.durationDays) || 0,
    };

    const result = await createCustomRequestAction(payload);
    setSubmitting(false);

    if (result.ok) {
      const created = normalizeItem(result.data);
      setFormData((prev) => ({
        ...DEFAULT_FORM,
        source: prev.source,
      }));
      setSubmitMessage("Custom request submitted. Our travel experts will reply soon.");
      if (created) {
        setRequests((prev) => [created, ...prev.filter((req) => req?._id !== created._id)]);
      }
    } else {
      setSubmitError(result?.data?.message || "Failed to submit your request. Try again.");
    }
  };

  const handleAdminFetch = async () => {
    if (!adminId.trim()) {
      setAdminError("Enter a request ID.");
      return;
    }
    setAdminLoading(true);
    setAdminError("");
    setAdminMessage("");
    const result = await getCustomRequestByIdAction(adminId.trim());
    setAdminLoading(false);
    if (result.ok) {
      const item = normalizeItem(result.data);
      setAdminRequest(item);
      setAdminStatus(item?.status || STATUS_OPTIONS[0]);
      setAdminRemarks(item?.remarks || "");
    } else {
      setAdminError("Request not found with that ID.");
      setAdminRequest(null);
    }
  };

  const handleAdminSave = async () => {
    if (!adminRequest?._id) return;
    setAdminLoading(true);
    setAdminError("");
    setAdminMessage("");
    const result = await updateCustomRequestAction(adminRequest._id, {
      status: adminStatus,
      remarks: adminRemarks,
    });
    setAdminLoading(false);
    if (result.ok) {
      setAdminMessage("Request updated.");
      const updated = normalizeItem(result.data) || { ...adminRequest, status: adminStatus, remarks: adminRemarks };
      setAdminRequest(updated);
      setRequests((prev) => prev.map((req) => (req?._id === updated?._id ? updated : req)));
    } else {
      setAdminError("Unable to update the request.");
    }
  };

  if (isLoading) {
    return <Loader message="Preparing custom request workspace..." />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.98)] p-6 shadow-[0_18px_45px_rgba(121,68,44,0.12)]">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-[color:var(--gh-heading)]">Tell us what you need</h2>
          <p className="text-sm text-[color:var(--gh-text-soft)]">
            Share your dream destination, budget, and dates. Our travel experts will craft a plan for you.
          </p>
        </div>

        {!user && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
            Log in first so we can link the request to your profile.
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-black uppercase tracking-[0.2em] text-[color:var(--gh-text-soft)]">Destination</label>
            <input
              className="mt-2 w-full rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-3 text-sm focus:border-[color:var(--gh-accent)] focus:outline-none"
              placeholder="Ex: Ladakh in September"
              name="destination"
              value={formData.destination}
              onChange={handleInputChange("destination")}
              required
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-[0.2em] text-[color:var(--gh-text-soft)]">Travel Dates</label>
            <div className="mt-2 flex flex-col gap-2 md:flex-row">
              <input
                type="date"
                className="flex-1 rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-3 text-sm focus:border-[color:var(--gh-accent)] focus:outline-none"
                value={formData.startDate}
                onChange={handleInputChange("startDate")}
                required
              />
              <input
                type="date"
                className="flex-1 rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-3 text-sm focus:border-[color:var(--gh-accent)] focus:outline-none"
                value={formData.endDate}
                onChange={handleInputChange("endDate")}
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="number"
              min="1"
              className="rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-3 text-sm focus:border-[color:var(--gh-accent)] focus:outline-none"
              placeholder="Travelers"
              value={formData.travellers}
              onChange={handleInputChange("travellers")}
              required
            />
            <input
              type="number"
              min="1"
              className="rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-3 text-sm focus:border-[color:var(--gh-accent)] focus:outline-none"
              placeholder="Duration (days)"
              value={formData.durationDays}
              onChange={handleInputChange("durationDays")}
            />
            <input
              type="number"
              min="0"
              className="rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-3 text-sm focus:border-[color:var(--gh-accent)] focus:outline-none"
              placeholder="Budget (₹)"
              value={formData.budget}
              onChange={handleInputChange("budget")}
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-[0.2em] text-[color:var(--gh-text-soft)]">Preferences</label>
            <textarea
              className="mt-2 w-full rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-3 text-sm focus:border-[color:var(--gh-accent)] focus:outline-none"
              rows="4"
              placeholder="Share interests, hotel choices, pace, or any flexibility notes."
              value={formData.preferences}
              onChange={handleInputChange("preferences")}
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-[0.2em] text-[color:var(--gh-text-soft)]">Query / Message</label>
            <textarea
              className="mt-2 w-full rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-3 text-sm focus:border-[color:var(--gh-accent)] focus:outline-none"
              rows="3"
              placeholder="Tell us anything else you want us to include."
              value={formData.query}
              onChange={handleInputChange("query")}
              required
            />
          </div>
          {submitError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {submitError}
            </div>
          )}
          {submitMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {submitMessage}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting || !user}
            className="w-full rounded-2xl bg-[linear-gradient(90deg,var(--gh-accent),var(--gh-accent-strong))] px-6 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(255,79,138,0.22)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Send Request"}
          </button>
        </form>
      </section>

      <section className="space-y-6">
        <div className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.98)] p-6 shadow-[0_18px_45px_rgba(121,68,44,0.12)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-[color:var(--gh-heading)]">My requests</h3>
              <p className="text-sm text-[color:var(--gh-text-soft)]">Track what you have shared with us.</p>
            </div>
            <button
              onClick={async () => {
                if (!user) return;
                setRequestsLoading(true);
                setRequestsError("");
                const result = await getMyCustomRequestsAction();
                setRequestsLoading(false);
                if (result.ok) {
                  setRequests(normalizeList(result.data));
                } else {
                  setRequestsError("Unable to refresh requests.");
                }
              }}
              disabled={!user}
              className="rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-2 text-xs font-black text-[color:var(--gh-text-soft)] hover:bg-[color:var(--gh-bg)] disabled:opacity-60"
            >
              Refresh
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {requestsLoading ? (
              <div className="text-sm font-semibold text-[color:var(--gh-text-soft)]">Loading your requests…</div>
            ) : requestsError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{requestsError}</div>
            ) : requests.length === 0 ? (
              <p className="text-sm text-[color:var(--gh-text-soft)]">You have not submitted any custom requests yet.</p>
            ) : (
              requests.map((request) => (
                <div key={request?._id || request?.id} className="rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-3 text-sm">
                <div className="flex flex-col items-start justify-between gap-1 sm:flex-row sm:items-center">
                  <p className="font-semibold text-[color:var(--gh-heading)]">{request.destination || "Custom itinerary"}</p>
                  <span
                    className={`px-3 py-1 text-xs font-black uppercase tracking-[0.2em] ${
                      String(request.status || "").toUpperCase() === "COMPLETED"
                        ? "text-emerald-700"
                          : String(request.status || "").toUpperCase() === "REJECTED"
                          ? "text-rose-700"
                          : "text-[color:var(--gh-text-soft)]"
                      }`}
                    >
                      {request.status || "PENDING"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[color:var(--gh-text-soft)]">
                    #{request._id || "—"} · {request.query || "No query provided"}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[color:var(--gh-text-soft)]">
                    {formatRequestTime(request)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.98)] p-6 shadow-[0_18px_45px_rgba(121,68,44,0.12)]">
            <h3 className="text-lg font-black text-[color:var(--gh-heading)]">Admin / Agent view</h3>
            <p className="mt-1 text-sm text-[color:var(--gh-text-soft)]">
              Fetch a request by ID to see its status and suggest updates.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                className="flex-1 rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-3 text-sm focus:border-[color:var(--gh-accent)] focus:outline-none"
                placeholder="Custom request ID"
                value={adminId}
                onChange={(event) => setAdminId(event.target.value)}
              />
              <button
                onClick={handleAdminFetch}
                disabled={adminLoading}
                className="w-full rounded-2xl bg-[color:var(--gh-heading)] px-4 py-3 text-xs font-black uppercase tracking-[0.3em] text-white hover:opacity-90 disabled:opacity-60 sm:w-auto"
              >
                {adminLoading ? "Fetching…" : "Load"}
              </button>
            </div>
            {adminError && <p className="mt-2 text-xs font-semibold text-rose-600">{adminError}</p>}
            {adminRequest && (
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-3 text-sm">
                  <p className="text-xs font-semibold text-[color:var(--gh-text-soft)]">Query</p>
                  <p className="mt-1 text-sm text-[color:var(--gh-heading)]">{adminRequest.query || "—"}</p>
                  <p className="mt-2 text-xs text-[color:var(--gh-text-soft)]">
                    Travelers: {adminRequest.travellers ?? "—"} · Duration: {adminRequest.durationDays ?? "—"} days
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-[color:var(--gh-text-soft)]">Status</label>
                  <select
                    className="w-full rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-3 text-sm focus:border-[color:var(--gh-accent)] focus:outline-none"
                    value={adminStatus}
                    onChange={(event) => setAdminStatus(event.target.value)}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-[color:var(--gh-text-soft)]">Remarks</label>
                  <textarea
                    rows="2"
                    className="mt-2 w-full rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-3 text-sm focus:border-[color:var(--gh-accent)] focus:outline-none"
                    value={adminRemarks}
                    onChange={(event) => setAdminRemarks(event.target.value)}
                  />
                </div>
                <button
                  onClick={handleAdminSave}
                  disabled={adminLoading}
                  className="w-full rounded-2xl bg-[linear-gradient(90deg,var(--gh-accent),var(--gh-accent-strong))] px-4 py-3 text-sm font-black text-white hover:opacity-90 disabled:opacity-60"
                >
                  Save changes
                </button>
                {adminMessage && <p className="text-xs font-semibold text-emerald-700">{adminMessage}</p>}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default CustomRequestFlow;

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Loader from "@/components/Loader";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const DEFAULT_FORM = {
  subject: "",
  message: "",
  phone: "",
  priority: "LOW",
};

export default function SupportTicketPage() {
  const { user, isLoading } = useAuth();
  const { showToast } = useToast();
  const { slug } = useParams();
  const [hasMounted, setHasMounted] = useState(false);
  const [form, setForm] = useState({
    ...DEFAULT_FORM,
    phone: user?.mobile || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState("");
  const [ticketRefreshKey, setTicketRefreshKey] = useState(0);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted || !user) {
      return;
    }

    let active = true;
    setTicketsLoading(true);
    setTicketsError("");

    const fetchTickets = async () => {
      try {
        const response = await fetch("/api/support/my", {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        const data = await response.json().catch(() => null);
        if (!active) return;

        if (response.ok) {
          setTickets(
            Array.isArray(data)
              ? data
              : Array.isArray(data?.data)
              ? data.data
              : []
          );
        } else {
          setTicketsError(data?.message || data?.error || "Unable to load your tickets.");
        }
      } catch {
        if (active) {
          setTicketsError("Unable to load your tickets. Please try again.");
        }
      } finally {
        if (active) {
          setTicketsLoading(false);
        }
      }
    };

    fetchTickets();

    return () => {
      active = false;
    };
  }, [hasMounted, user, ticketRefreshKey]);

  const refreshTickets = () => setTicketRefreshKey((prev) => prev + 1);

  if (!hasMounted || isLoading) {
    return <Loader message="Loading support..." />;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="text-3xl font-black text-slate-900">Support Ticket</h1>
        <p className="mt-4 text-slate-600">Please log in to raise a support ticket.</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link href="/" className="inline-flex rounded-2xl bg-emerald-500 px-6 py-3 text-white font-bold hover:bg-emerald-600">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const title = slug ? slug.replace(/[-_]/g, " ") : "support";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!form.subject.trim() || !form.message.trim()) {
      setErrorMessage("Please provide both subject and message to raise a ticket.");
      return;
    }

    setSubmitting(true);

    const payload = {
      priority: form.priority || "LOW",
      message: form.message,
      subject: form.subject,
      phone: form.phone || user.mobile,
      name: `${user.firstName || user.name || ""} ${user.lastName || ""}`.trim(),
      userId: user._id || user.id,
    };

    const response = await fetch("/api/support", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (response.ok) {
      const successText = "Your ticket has been raised successfully. Our support team will get back to you soon.";
      setSuccessMessage(successText);
      showToast({ type: "success", message: successText });
      setForm({ ...DEFAULT_FORM, phone: user.mobile || "" });
      refreshTickets();
    } else {
      const errorText = data?.message || data?.error || "Unable to raise support ticket. Please try again later.";
      setErrorMessage(errorText);
      showToast({ type: "error", message: errorText });
    }

    setSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Breadcrumbs
        items={[
          { href: "/support", label: "Support" },
          { href: `/support/${slug}`, label: title },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Raise a Support Ticket</h1>
        <p className="mt-3 text-slate-600">Submit your issue for {title} and our team will respond soon.</p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        {successMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Subject</label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Enter ticket subject"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows="6"
              placeholder="Describe your issue in detail"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Name</label>
              <input
                type="text"
                name="name"
                value={`${user.firstName || user.name || ""} ${user.lastName || ""}`.trim()}
                disabled
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Your phone number"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="inline-flex rounded-2xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50">
              Back to Home
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {submitting ? "Raising ticket..." : "Raise Ticket"}
            </button>
          </div>
        </form>
      </div>

      <aside className="rounded-3xl border border-black/10 bg-slate-50 p-6 shadow-sm">
        <div className="mb-5">
          <div className="text-xs font-extrabold uppercase tracking-[0.32em] text-slate-500">My Tickets</div>
          <p className="mt-2 text-sm text-slate-600">Your raised support tickets appear here.</p>
        </div>

        {ticketsLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Loading your tickets...
          </div>
        ) : ticketsError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {ticketsError}
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            No tickets found yet. Raise one using the form on the left.
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket._id || ticket.id || ticket.subject} className="rounded-3xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-900">{ticket.subject || "Support Ticket"}</p>
                    <p className="mt-1 text-xs text-slate-500">{ticket.priority || ticket.status || "Open"}</p>
                  </div>
                  {ticket.status && (
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                      ticket.status === "CLOSED" ? "bg-slate-100 text-slate-700" : ticket.status === "OPEN" ? "bg-emerald-100 text-emerald-700" : ticket.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                    }`}>
                      {ticket.status.replace(/_/g, " ")}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-slate-600 line-clamp-3">{ticket.message || ticket.description || "No description available."}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                  {ticket.createdAt && <span>Created {new Date(ticket.createdAt).toLocaleDateString("en-IN")}</span>}
                  {ticket.priority && <span>Priority: {ticket.priority}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>
      </div>
    </div>
  );
}


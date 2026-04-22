"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Headset, MessageCircleQuestion, Search, Sparkles, X } from "lucide-react";

function normalizeText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

async function fetchFaqList({ query } = {}) {
  const url = new URL("/api/chatbot/faq", window.location.origin);
  url.searchParams.set("isActive", "true");
  if (query) url.searchParams.set("query", query);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const json = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data: json };
}

export function ChatbotWidget({ title = "Help Center" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const safeQuery = useMemo(() => normalizeText(query), [query]);

  const resetState = useCallback(() => {
    setQuery("");
    setFaqs([]);
    setSelected(null);
    setStatus("idle");
    setError("");
  }, []);

  const closeWidget = useCallback(() => {
    resetState();
    setOpen(false);
  }, [resetState]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeWidget();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeWidget]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(async () => {
      setStatus("loading");
      setError("");
      const res = await fetchFaqList({ query: safeQuery || undefined });
      if (!res.ok) {
        setFaqs([]);
        setSelected(null);
        setStatus("failed");
        setError(res.data?.error || "Failed to load FAQs");
        return;
      }

      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      setFaqs(items);
      if (items.length === 0) setSelected(null);
      setStatus("succeeded");
    }, safeQuery ? 350 : 0);

    return () => window.clearTimeout(id);
  }, [open, safeQuery]);

  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const currentAnswer = selected?.answer || "";

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="gh-surface flex max-h-[calc(100vh-120px)] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[30px] border border-[color:var(--gh-border)] bg-[color:var(--gh-surface-strong)]">
          <div className="relative overflow-hidden border-b border-[color:var(--gh-border)] bg-[linear-gradient(135deg,rgba(255,79,138,0.16),rgba(255,185,94,0.2))] px-5 py-4">
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/35 blur-3xl" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--gh-accent)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Live Support
                </div>
                <div className="mt-3 text-lg font-black tracking-tight text-[color:var(--gh-heading)]">{title}</div>
                <div className="mt-1 text-xs font-semibold text-[color:var(--gh-text-soft)]">
                  Ask about bookings, refunds, payments, or support.
                </div>
              </div>
              <button
                type="button"
                onClick={closeWidget}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/80 text-[color:var(--gh-heading)] hover:bg-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="rounded-[24px] border border-[color:var(--gh-border)] bg-white/80 p-2 shadow-[0_10px_30px_rgba(121,68,44,0.08)]">
              <div className="flex items-center gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--gh-accent-soft)] text-[color:var(--gh-accent)]">
                  <Search className="h-4.5 w-4.5" />
                </div>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search FAQs..."
                  className="h-11 w-full rounded-2xl bg-transparent pr-2 text-sm font-semibold text-[color:var(--gh-heading)] outline-none placeholder:text-[color:var(--gh-text-soft)]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-[color:var(--gh-border)] bg-white px-3 text-sm font-black text-[color:var(--gh-heading)] hover:bg-[color:var(--gh-bg-soft)]"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="rounded-[26px] border border-[color:var(--gh-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,242,231,0.88))] p-4">
                <div className="text-[11px] font-black uppercase tracking-[0.25em] text-[color:var(--gh-text-soft)]">Quick Help</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Booking confirmation", "Cancel booking", "Refund policy", "Contact support"].map((text) => (
                    <button
                      key={text}
                      type="button"
                      onClick={() => setQuery(text)}
                      className="rounded-full border border-[color:var(--gh-border)] bg-white px-3 py-1.5 text-xs font-black text-[color:var(--gh-heading)] hover:bg-[color:var(--gh-bg-soft)] hover:text-[color:var(--gh-accent)]"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] text-[color:var(--gh-text-soft)]">
                  <MessageCircleQuestion className="h-4 w-4 text-[color:var(--gh-accent)]" />
                  {status === "loading" ? "Loading..." : "FAQs"}
                </div>

                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {error}
                  </div>
                ) : null}

                {faqs.length === 0 && status !== "loading" ? (
                  <div className="rounded-[24px] border border-[color:var(--gh-border)] bg-white px-4 py-4 text-sm font-semibold text-[color:var(--gh-text-soft)]">
                    No matching FAQs found.
                  </div>
                ) : null}

                {faqs.length > 0 ? (
                  <div className="grid gap-2">
                    {faqs.slice(0, 6).map((item) => (
                      <button
                        key={item?._id || item?.question}
                        type="button"
                        onClick={() => setSelected(item)}
                        className={`w-full rounded-[22px] border px-4 py-3 text-left text-sm font-black transition ${
                          selected?._id && item?._id === selected._id
                            ? "border-pink-200 bg-[linear-gradient(135deg,rgba(255,79,138,0.08),rgba(255,185,94,0.16))] text-[color:var(--gh-heading)]"
                            : "border-[color:var(--gh-border)] bg-white text-[color:var(--gh-heading)] hover:bg-[color:var(--gh-bg-soft)]"
                        }`}
                      >
                        {item?.question || "FAQ"}
                      </button>
                    ))}
                  </div>
                ) : null}

                {currentAnswer ? (
                  <div className="rounded-[26px] border border-[color:var(--gh-border)] bg-white p-4 shadow-[0_10px_30px_rgba(121,68,44,0.06)]">
                    <div className="text-[11px] font-black uppercase tracking-[0.25em] text-[color:var(--gh-text-soft)]">Answer</div>
                    <div className="mt-3 text-sm font-semibold leading-7 text-[color:var(--gh-text)]">{currentAnswer}</div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="border-t border-[color:var(--gh-border)] bg-white/80 px-4 py-3">
            <div className="text-xs font-semibold text-[color:var(--gh-text-soft)]">
              Tip: press <span className="font-black text-[color:var(--gh-heading)]">Esc</span> to close.
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="gh-primary-btn ml-auto inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/40 text-white shadow-[0_24px_50px_rgba(255,79,138,0.28)]"
        aria-label="Open help center chat"
      >
        <Headset className="h-7 w-7" />
      </button>
    </div>
  );
}

export default ChatbotWidget;

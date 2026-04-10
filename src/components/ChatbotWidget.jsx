"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
        <div className="flex max-h-[calc(100vh-120px)] w-[340px] flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_18px_60px_rgba(2,6,23,0.18)]">
          <div className="flex items-center justify-between gap-3 border-b border-black/5 bg-slate-900 px-4 py-3 text-white">
            <div className="min-w-0">
              <div className="text-sm font-black tracking-tight">{title}</div>
              <div className="text-xs font-semibold text-white/80">Ask anything about bookings, refunds, support.</div>
            </div>
            <button
              type="button"
              onClick={closeWidget}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg font-black hover:bg-white/15"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search FAQs…"
                className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-black/10 bg-white px-3 text-sm font-black text-slate-900 hover:bg-slate-50"
              >
                Clear
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-black/10 bg-slate-50 p-3">
                <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-600">Suggestions</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Booking confirmation", "Cancel booking", "Refund policy", "Contact support"].map((text) => (
                    <button
                      key={text}
                      type="button"
                      onClick={() => setQuery(text)}
                      className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-black text-slate-900 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-600">
                  {status === "loading" ? "Loading…" : "FAQs"}
                </div>

                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {error}
                  </div>
                ) : null}

                {faqs.length === 0 && status !== "loading" ? (
                  <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
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
                        className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${
                          selected?._id && item?._id === selected._id
                            ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                            : "border-black/10 bg-white text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        {item?.question || "FAQ"}
                      </button>
                    ))}
                  </div>
                ) : null}

                {currentAnswer ? (
                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-600">Answer</div>
                    <div className="mt-2 text-sm font-semibold leading-relaxed text-slate-800">{currentAnswer}</div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="border-t border-black/5 bg-white px-4 py-3">
            <div className="text-xs font-semibold text-slate-500">
              Tip: press <span className="font-black">Esc</span> to close.
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ml-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl font-black text-white shadow-[0_18px_50px_rgba(16,185,129,0.38)] hover:bg-emerald-700"
        aria-label="Open help center chat"
      >
        ?
      </button>
    </div>
  );
}

export default ChatbotWidget;

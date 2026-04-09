"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  getMyNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/actions/notifications.actions";
import { checkAuthTokenAction } from "@/actions/auth.check";

function formatWhen(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationsDropdown({
  initialUnreadCount = 0,
  onUnreadCountChange,
  align = "right",
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const rootRef = useRef(null);

  const positionClass = useMemo(() => {
    if (align === "left") return "left-0";
    return "right-0";
  }, [align]);

  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount]);

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [onUnreadCountChange, unreadCount]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    const onMouseDown = (event) => {
      const root = rootRef.current;
      if (!root) return;
      if (!root.contains(event.target)) setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [open]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const auth = await checkAuthTokenAction();
      if (!auth?.hasToken) {
        setItems([]);
        setUnreadCount(0);
        setError("Please log in to view notifications.");
        return;
      }

      const response = await getMyNotificationsAction({ page: 1, limit: 20 });
      if (!response?.ok) {
        setItems([]);
        setError(response?.data?.error || response?.data?.message || "Failed to load notifications.");
        return;
      }

      const nextItems = response?.data?.data?.items || [];
      setItems(nextItems);

      const computedUnread = nextItems.reduce((count, n) => {
        if (n?.isRead === false) return count + 1;
        return count;
      }, 0);
      setUnreadCount(computedUnread);
    } catch {
      setItems([]);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  const onToggle = async () => {
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!open) return;
    refresh();
  }, [open, refresh]);

  const markAllRead = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await markAllNotificationsReadAction();
      if (!response?.ok) {
        setError(response?.data?.error || response?.data?.message || "Failed to mark all as read.");
        return;
      }
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      setError("Failed to mark all as read.");
    } finally {
      setLoading(false);
    }
  };

  const markOneRead = async (notificationId) => {
    if (!notificationId) return;
    try {
      const response = await markNotificationReadAction(notificationId);
      if (!response?.ok) return;

      setItems((prev) =>
        prev.map((n) => (n?._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // best-effort
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="relative inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-black text-slate-900 hover:bg-slate-50"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <span className="text-lg mr-2">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-xs font-black text-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute ${positionClass} mt-3 w-[22rem] max-w-[92vw] overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_18px_45px_rgba(2,6,23,0.18)]`}
          role="dialog"
          aria-label="Notifications panel"
        >
          <div className="flex items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
            <div className="min-w-0">
              <div className="text-sm font-black text-slate-900">Notifications</div>
              <div className="text-xs font-semibold text-slate-500">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refresh}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-black text-slate-900 hover:bg-slate-50 disabled:opacity-60"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={markAllRead}
                disabled={loading || items.length === 0 || unreadCount === 0}
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-3 py-2 text-xs font-black text-white hover:bg-emerald-600 disabled:opacity-60"
              >
                Mark all read
              </button>
            </div>
          </div>

          <div className="max-h-[26rem] overflow-y-auto">
            {loading && (
              <div className="px-5 py-6 text-sm font-semibold text-slate-600">Loading...</div>
            )}

            {!loading && error && (
              <div className="px-5 py-6 text-sm font-semibold text-rose-700">{error}</div>
            )}

            {!loading && !error && items.length === 0 && (
              <div className="px-5 py-10 text-sm font-semibold text-slate-600">
                No notifications yet.
              </div>
            )}

            {!loading &&
              !error &&
              items.map((n) => {
                const isUnread = n?.isRead === false;
                return (
                  <button
                    key={n?._id || `${n?.title}-${n?.createdAt}`}
                    type="button"
                    onClick={() => markOneRead(n?._id)}
                    className={`w-full text-left px-5 py-4 hover:bg-slate-50 ${
                      isUnread ? "bg-emerald-50/40" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black text-slate-900">
                          {n?.title || "Notification"}
                        </div>
                        {n?.message && (
                          <div className="mt-1 line-clamp-2 text-sm font-semibold text-slate-600">
                            {n.message}
                          </div>
                        )}
                        {n?.createdAt && (
                          <div className="mt-2 text-xs font-semibold text-slate-500">
                            {formatWhen(n.createdAt)}
                          </div>
                        )}
                      </div>
                      {isUnread && (
                        <span
                          className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-emerald-600"
                          aria-label="Unread"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
          </div>

          <div className="border-t border-black/5 px-5 py-3">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="inline-flex text-xs font-black text-emerald-700 hover:text-emerald-800"
            >
              Close
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

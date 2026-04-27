"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";

import {
  getMyNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/actions/notifications.actions";
import { checkAuthTokenAction } from "@/actions/auth.check";
import { Button } from "@/components/ui/button";

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
  variant = "header-light",
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const rootRef = useRef(null);

  const positionClass = useMemo(() => (align === "left" ? "left-0" : "right-0"), [align]);
  const isDark = variant === "header-dark";
  const displayUnreadCount = items.length > 0 || open || loading || error ? unreadCount : initialUnreadCount;

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
        setError("Please log in to view alerts.");
        return;
      }

      const response = await getMyNotificationsAction({ page: 1, limit: 20 });
      if (!response?.ok) {
        setItems([]);
        setError(response?.data?.error || response?.data?.message || "Failed to load alerts.");
        return;
      }

      const nextItems = response?.data?.data?.items || [];
      setItems(nextItems);

      const computedUnread = nextItems.reduce((count, notification) => {
        if (notification?.isRead === false) return count + 1;
        return count;
      }, 0);
      setUnreadCount(computedUnread);
    } catch {
      setItems([]);
      setError("Failed to load alerts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timeoutId);
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
      setItems((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
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
        prev.map((notification) =>
          notification?._id === notificationId ? { ...notification, isRead: true } : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // best-effort
    }
  };

  const onToggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={[
          "relative inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm font-black transition",
          isDark
            ? "border-white/15 bg-white/10 text-white hover:bg-white/15"
            : "border-black/10 bg-white text-slate-900 hover:bg-slate-50",
        ].join(" ")}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        <span className="hidden sm:inline">Alerts</span>
        {displayUnreadCount > 0 && (
          <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gh-gold px-1.5 text-xs font-black text-gh-plum shadow-sm">
            {displayUnreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute ${positionClass} mt-3 w-[23rem] max-w-[92vw] overflow-hidden rounded-3xl border border-black/10 bg-white shadow-gh-soft`}
          role="dialog"
          aria-label="Notifications panel"
        >
          <div className="flex items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
            <div className="min-w-0">
              <div className="text-sm font-black text-slate-900">
                Alerts{" "}
                <span className="text-xs font-semibold text-slate-500">
                  ({items.length} item{items.length !== 1 ? "s" : ""})
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-500">
                {displayUnreadCount > 0 ? (
                  <>
                    Unread: <span className="font-black text-slate-900">{displayUnreadCount}</span>
                  </>
                ) : (
                  "All caught up"
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-black/10 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              aria-label="Refresh alerts"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            </button>
          </div>

          <div className="max-h-[22rem] overflow-y-auto">
            {loading && (
              <div className="px-5 py-6 text-sm font-semibold text-slate-600">
                Loading your alerts...
              </div>
            )}

            {!loading && error && (
              <div className="px-5 py-6 text-sm font-semibold text-rose-700">{error}</div>
            )}

            {!loading && !error && items.length === 0 && (
              <div className="px-5 py-10 text-sm font-semibold text-slate-600">
                No alerts yet.
              </div>
            )}

            {!loading &&
              !error &&
              items.map((notification) => {
                const isUnread = notification?.isRead === false;
                return (
                  <button
                    key={notification?._id || `${notification?.title}-${notification?.createdAt}`}
                    type="button"
                    onClick={() => markOneRead(notification?._id)}
                    className={`w-full border-b border-black/5 px-5 py-4 text-left last:border-b-0 ${
                      isUnread ? "bg-[color:var(--gh-bg-soft)]" : "bg-white"
                    } hover:bg-slate-50`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-black text-slate-900">
                          {notification?.title || "Notification"}
                        </div>
                        {notification?.message ? (
                          <div className="mt-1 line-clamp-2 text-sm font-semibold text-slate-600">
                            {notification.message}
                          </div>
                        ) : null}
                        {notification?.createdAt ? (
                          <div className="mt-2 text-xs font-semibold text-slate-500">
                            {formatWhen(notification.createdAt)}
                          </div>
                        ) : null}
                      </div>
                      {isUnread ? (
                        <span
                          className="mt-1 inline-flex h-2.5 w-2.5 flex-none rounded-full bg-[color:var(--gh-accent)]"
                          aria-label="Unread"
                        />
                      ) : null}
                    </div>
                  </button>
                );
              })}
          </div>

          <div className="border-t border-black/5 px-5 py-4">
            <div className="grid gap-2">
              <Button
                type="button"
                onClick={markAllRead}
                disabled={loading || items.length === 0 || unreadCount === 0}
                variant="gradient"
                className="w-full rounded-2xl py-3 text-sm font-black"
              >
                <CheckCheck className="h-4 w-4" />
                Mark All Read
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full rounded-2xl py-3 text-sm font-black"
              >
                <Link href="/" onClick={() => setOpen(false)}>
                  Close
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

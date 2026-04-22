"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarRange, ChevronRight, LogOut, User2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { logoutAction } from "../actions/auth.actions";

export function UserMenu() {
  const router = useRouter();
  const { user, clearUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = (user.firstName && user.lastName)
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : (user.userName?.[0] || "?").toUpperCase();

  const handleLogout = async () => {
    await logoutAction();
    clearUser();
    setIsOpen(false);
    router.push("/");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gh-gold text-gh-plum font-black text-sm transition hover:bg-gh-gold2"
        title={`${user.firstName} ${user.lastName}`}
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-[color:var(--gh-border)] bg-[color:var(--gh-surface-strong)] shadow-gh-soft">
          <div className="border-b border-[color:var(--gh-border)] bg-[linear-gradient(135deg,rgba(255,79,138,0.08),rgba(255,185,94,0.14))] px-4 py-4">
            <div className="text-sm font-bold text-[color:var(--gh-heading)]">
              {user.firstName} {user.lastName}
            </div>
            <div className="mt-1 text-xs font-semibold text-[color:var(--gh-text-soft)]">{user.email}</div>
          </div>

          <div className="px-3 py-3">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/profile");
              }}
              className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-semibold text-[color:var(--gh-heading)] transition hover:bg-[color:var(--gh-bg-soft)]"
            >
              <span className="inline-flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[color:var(--gh-accent-soft)] text-[color:var(--gh-accent)]">
                  <User2 className="h-4 w-4" />
                </span>
                Profile
              </span>
              <ChevronRight className="h-4 w-4 text-[color:var(--gh-text-soft)]" />
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/bookings");
              }}
              className="mt-2 flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-semibold text-[color:var(--gh-heading)] transition hover:bg-[color:var(--gh-bg-soft)]"
            >
              <span className="inline-flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(255,79,138,0.12),rgba(255,185,94,0.2))] text-[color:var(--gh-accent)]">
                  <CalendarRange className="h-4 w-4" />
                </span>
                My Bookings
              </span>
              <ChevronRight className="h-4 w-4 text-[color:var(--gh-text-soft)]" />
            </button>
          </div>

          <div className="border-t border-[color:var(--gh-border)] px-4 py-3">
            <button
              onClick={handleLogout}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 px-3 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

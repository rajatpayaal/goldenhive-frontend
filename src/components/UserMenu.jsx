"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

  const avatarUrl = user.profilePicture || user.avatar;

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
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gh-gold text-gh-plum font-black text-sm transition hover:scale-105 active:scale-95 after:absolute after:-inset-0.5"
        title={`${user.firstName} ${user.lastName}`}
      >
        {avatarUrl ? (
          <Image src={avatarUrl} alt="" width={40} height={40} className="h-full w-full object-cover rounded-full" />
        ) : (
          initials
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-[0_8px_32px_rgba(17,24,39,0.12)]">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-black text-white shadow-md">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="" width={56} height={56} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-base font-black text-slate-900">
                  {user.firstName} {user.lastName}
                </div>
                <div className="truncate mt-0.5 text-xs font-semibold text-slate-500">{user.email}</div>
              </div>
            </div>
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

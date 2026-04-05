"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { logoutAction } from "../actions/auth.actions";

export function UserMenu() {
  const { user, setUser } = useAuth();
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
    setUser(null);
    setIsOpen(false);
    // Redirect to home
    window.location.href = "/";
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center rounded-full bg-emerald-500 w-10 h-10 text-white font-bold text-sm hover:bg-emerald-600 transition"
        title={`${user.firstName} ${user.lastName}`}
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-black/10 bg-white shadow-lg">
          <div className="px-4 py-3 border-b border-black/5">
            <div className="text-sm font-bold text-slate-900">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-xs text-slate-500">{user.email}</div>
          </div>

          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                // Navigate to profile page
                window.location.href = "/profile";
              }}
              className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
            >
              Profile
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                // Navigate to bookings page
                window.location.href = "/bookings";
              }}
              className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
            >
              My Bookings
            </button>
          </div>

          <div className="border-t border-black/5 px-4 py-2">
            <button
              onClick={handleLogout}
              className="w-full rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-100 transition"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

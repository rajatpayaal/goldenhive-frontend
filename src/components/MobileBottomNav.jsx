"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Headset, Newspaper, User, Ticket } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LoginModal } from "./LoginModal";
import { ChatbotWidget } from "./ChatbotWidget";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Packages", href: "/packages", icon: ShoppingBag },
    { name: "Trips", href: "/bookings", icon: Ticket },
    { name: "Help", href: null, icon: Headset, isCentral: true },
    { name: "Blogs", href: "/blogs", icon: Newspaper },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <>
      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Safe area bg fill */}
        <div className="bg-white/95 backdrop-blur-xl shadow-[0_-4px_24px_rgba(17,24,39,0.10)] border-t border-slate-100">
          <div className="flex items-end justify-around px-2 pt-2 pb-3">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href && item.href !== "/" && pathname?.startsWith(item.href));
              const isRestricted = item.name === "Trips" || item.name === "Profile";

              const handleClick = (e) => {
                if (!user && isRestricted) {
                  e.preventDefault();
                  setIsLoginOpen(true);
                }
              };

              /* ── Central "Help" button ── */
              if (item.isCentral) {
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setHelpOpen(true)}
                    className="group relative -mt-6 flex flex-col items-center gap-1"
                    aria-label="Help Center"
                  >
                    {/* Outer ring glow */}
                    <div className="absolute inset-0 -m-1 rounded-full bg-[color:var(--gh-accent-soft)] blur-md opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--gh-accent),var(--gh-accent-strong))] shadow-[0_8px_28px_rgba(225,29,72,0.45)] transition-transform active:scale-95 group-hover:scale-105">
                      <item.icon className="h-6 w-6 text-white" strokeWidth={1.8} />
                    </div>
                    <span className="text-[9px] font-bold tracking-wide text-[color:var(--gh-accent)]">
                      {item.name}
                    </span>
                  </button>
                );
              }

              /* ── Regular nav items ── */
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleClick}
                  className="flex flex-col items-center gap-1 min-w-[52px] py-1 transition-all"
                  aria-label={item.name}
                >
                  <div className="relative flex items-center justify-center">
                    <item.icon
                      className={`h-[22px] w-[22px] transition-colors ${
                        isActive
                          ? "text-[color:var(--gh-accent)]"
                          : "text-slate-400"
                      }`}
                      fill={isActive ? "currentColor" : "none"}
                      strokeWidth={isActive ? 0 : 1.8}
                    />
                    {/* Active indicator dot */}
                    {isActive && (
                      <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[color:var(--gh-accent)]" />
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-bold tracking-wide ${
                      isActive
                        ? "text-[color:var(--gh-accent)]"
                        : "text-slate-400"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* Help overlay backdrop */}
      {helpOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setHelpOpen(false)}
        />
      )}

      {/* ChatbotWidget */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] md:hidden">
        <ChatbotWidget isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      </div>
    </>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Headset, Map, User } from "lucide-react";
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
    { name: "Help", href: null, icon: Headset, isCentral: true },
    { name: "Trips", href: "/bookings", icon: Map },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-[color:var(--gh-border)] bg-white/95 px-5 py-2 pb-safe md:hidden shadow-[0_-8px_30px_rgba(17,24,39,0.08)] backdrop-blur-lg">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          const isRestricted = item.name === "Trips" || item.name === "Profile";

          const handleClick = (e) => {
            if (!user && isRestricted) {
              e.preventDefault();
              setIsLoginOpen(true);
            }
          };

          if (item.isCentral) {
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => setHelpOpen(true)}
                className="group relative -mt-7 flex flex-col items-center justify-center gap-1"
                aria-label="Help Center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--gh-accent),var(--gh-accent-strong))] shadow-[0_8px_24px_rgba(255,79,138,0.4)] transition-transform active:scale-95 group-hover:scale-105">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-[9px] font-black text-[color:var(--gh-text-soft)]">
                  {item.name}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleClick}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? "text-[color:var(--gh-accent)]" : "text-slate-400 hover:text-[color:var(--gh-text-soft)]"
              }`}
              aria-label={item.name}
            >
              <item.icon
                className="h-5 w-5"
                fill={isActive ? "currentColor" : "none"}
                strokeWidth={2}
              />
              <span
                className={`text-[9px] font-black ${
                  isActive ? "text-[color:var(--gh-accent)]" : "text-slate-400"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      {helpOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setHelpOpen(false)}
        />
      )}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] md:hidden">
        <ChatbotWidget isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      </div>
    </>
  );
}

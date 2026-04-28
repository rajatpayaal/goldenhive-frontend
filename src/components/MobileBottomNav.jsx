"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Map, User, Briefcase } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Packages", href: "/packages", icon: Briefcase },
    { name: "Explore", href: "/explore", icon: Compass, isCentral: true },
    { name: "Trips", href: "/trips", icon: Map },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-black/5 bg-white px-6 py-2 pb-safe md:hidden shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        if (item.isCentral) {
          return (
            <Link
              key={item.name}
              href={item.href}
              className="group relative -mt-8 flex flex-col items-center justify-center gap-1"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gh-rose shadow-[0_8px_20px_rgba(225,29,72,0.4)] transition-transform active:scale-95">
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-[10px] font-bold text-slate-500">
                {item.name}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive ? "text-gh-rose" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <item.icon
              className="h-5 w-5"
              fill={isActive ? "currentColor" : "none"}
              strokeWidth={isActive ? 2 : 2}
            />
            <span
              className={`text-[10px] font-bold ${
                isActive ? "text-gh-rose" : "text-slate-500"
              }`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

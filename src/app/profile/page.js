"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Loader from "@/components/Loader";
import { User, Mail, Phone, AtSign, Shield, Calendar, CheckCircle, AlertCircle } from "lucide-react";

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-4 rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-3.5">
    {Icon && (
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[color:var(--gh-accent-soft)] text-[color:var(--gh-accent)]">
        <Icon className="h-4 w-4" />
      </div>
    )}
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[color:var(--gh-text-soft)]">{label}</p>
      <p className="mt-0.5 truncate text-sm font-bold text-[color:var(--gh-heading)]">{value || "—"}</p>
    </div>
  </div>
);

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Loader message="Loading profile..." />;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-5 sm:py-20 text-center">
        <div className="rounded-2xl border border-[color:var(--gh-border)] bg-white px-6 py-14 shadow-gh-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-[color:var(--gh-accent-soft)] text-[color:var(--gh-accent)]">
            <User className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-3xl font-black text-[color:var(--gh-heading)]">My Profile</h1>
          <p className="mt-3 text-base font-medium text-[color:var(--gh-text-soft)]">Please log in to view your profile.</p>
          <Link href="/" className="mt-7 gh-primary-btn inline-flex items-center justify-center rounded-2xl px-7 py-3.5 text-sm font-black">
            Go Home
          </Link>
        </div>
      </div>
    );
  }



  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-5 sm:py-12">
      {/* Page Hero */}
      <section className="mb-8 overflow-hidden rounded-2xl border border-gh-navy/10 bg-gh-navy px-6 py-8 text-white shadow-gh-medium sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-64 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_60%)]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] border border-white/20 bg-white/10 backdrop-blur-sm text-2xl font-black text-white">
            {user.firstName?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-white/60">My Account</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
              {user.firstName} {user.lastName}
            </h1>
            <p className="mt-1 text-sm font-semibold text-white/70">@{user.userName}</p>
          </div>
          <div className="sm:ml-auto">
            {user.isVerified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-1.5 text-xs font-black text-emerald-300">
                <CheckCircle className="h-3.5 w-3.5" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1.5 text-xs font-black text-amber-300">
                <AlertCircle className="h-3.5 w-3.5" />
                Not Verified
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Personal Info */}
        <div className="rounded-2xl border border-[color:var(--gh-border)] bg-white p-5 shadow-gh-soft sm:p-6">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">Personal Information</p>
          <div className="space-y-3">
            <InfoRow label="First Name" value={user.firstName} icon={User} />
            <InfoRow label="Last Name" value={user.lastName} icon={User} />
            <InfoRow label="Email" value={user.email} icon={Mail} />
            <InfoRow label="Mobile" value={user.mobile} icon={Phone} />
            <InfoRow label="Username" value={user.userName} icon={AtSign} />
          </div>
        </div>

        {/* Account Info */}
        <div className="rounded-2xl border border-[color:var(--gh-border)] bg-white p-5 shadow-gh-soft sm:p-6">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">Account Details</p>
          <div className="space-y-3">
            <InfoRow label="Role" value={user.role} icon={Shield} />
            <InfoRow label="Gender" value={user.gender || "Not specified"} icon={User} />
            <InfoRow
              label="Member Since"
              value={new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              icon={Calendar}
            />
            <div className="flex items-start gap-4 rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] px-4 py-3.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[color:var(--gh-accent-soft)] text-[color:var(--gh-accent)]">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[color:var(--gh-text-soft)]">Account Status</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    user.isVerified
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {user.isVerified ? "Verified" : "Not Verified"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: "/bookings", label: "My Bookings" },
          { href: "/cart", label: "My Cart" },
          { href: "/custom-requests", label: "Custom Requests" },
          { href: "/", label: "Explore Packages" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-[color:var(--gh-border)] bg-white px-4 py-3 text-center text-sm font-black text-[color:var(--gh-heading)] shadow-gh-soft transition hover:bg-[color:var(--gh-accent-soft)] hover:text-[color:var(--gh-accent)]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import {
  User,
  Mail,
  Phone,
  AtSign,
  Shield,
  Calendar,
  CheckCircle,
  AlertCircle,
  LogOut,
  Camera,
  MapPin,
  Settings,
  CreditCard,
  Heart,
  ChevronRight,
  Package,
  BookOpenText,
} from "lucide-react";
import { logoutAction } from "@/actions/auth.actions";
import Image from "next/image";

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-4 py-4 border-b border-slate-100 last:border-0">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
      <Icon className="h-5 w-5" strokeWidth={1.5} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-0.5 truncate text-[13px] font-bold text-slate-900">{value || "—"}</p>
    </div>
  </div>
);

const QuickLink = ({ href, label, icon: Icon, color = "bg-slate-50" }) => (
  <Link
    href={href}
    className="group flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_2px_12px_rgba(17,24,39,0.06)] transition hover:shadow-md active:scale-[0.98]"
  >
    <div className="flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
        <Icon className="h-6 w-6 text-slate-700" strokeWidth={1.5} />
      </div>
      <span className="text-sm font-black text-slate-900">{label}</span>
    </div>
    <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-400" />
  </Link>
);

export default function ProfilePage() {
  const { user, isLoading, clearUser } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    clearUser();
    router.push("/");
  };

  if (isLoading) {
    return <Loader message="Loading your profile..." />;
  }

  if (!user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-[0_4px_24px_rgba(17,24,39,0.08)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[color:var(--gh-accent-soft)]">
            <User className="h-10 w-10 text-[color:var(--gh-accent)]" />
          </div>
          <h1 className="mt-6 text-2xl font-black text-slate-900">Sign in to continue</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">Please log in to manage your profile and bookings.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-8 w-full rounded-full bg-[linear-gradient(135deg,var(--gh-accent),var(--gh-accent-strong))] py-4 text-sm font-black text-white shadow-sm transition active:scale-95"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const avatarUrl = user.profilePicture || user.avatar;
  const initials = (user.firstName?.[0] || "") + (user.lastName?.[0] || "");

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-32">
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1040] via-[#2d1b69] to-[#4a0e2e] pb-24 pt-16 text-white md:pb-32 md:pt-24">
        {/* Background Pattern/Nature Image */}
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80)" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1a1040]/60" />

        <div className="relative mx-auto max-w-5xl px-6 md:px-12">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-end">
            {/* Avatar Section */}
            <div className="relative">
              <div className="h-32 w-32 overflow-hidden rounded-[40px] border-4 border-white/20 bg-white/10 backdrop-blur-md md:h-40 md:w-40">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={user.firstName} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-4xl font-black text-white md:text-5xl">
                    {initials || <User className="h-16 w-16 opacity-50" />}
                  </div>
                )}
              </div>
              <button className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-lg transition active:scale-90 md:h-12 md:w-12">
                <Camera className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            {/* Profile Info Text */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
                  {user.firstName} {user.lastName}
                </h1>
                {user.isVerified && (
                  <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-white shadow-[0_0_12px_rgba(52,211,153,0.4)]">
                    <CheckCircle className="h-4 w-4" strokeWidth={3} />
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 md:justify-start">
                <span className="flex items-center gap-1.5 text-sm font-bold text-white/80">
                  <AtSign className="h-4 w-4 text-white/50" />
                  {user.userName}
                </span>
                <span className="flex items-center gap-1.5 text-sm font-bold text-white/80">
                  <MapPin className="h-4 w-4 text-white/50" />
                  {user.location || "Earth Explorer"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 md:mb-2">
              <button className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-black text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95">
                <Settings className="h-4 w-4" strokeWidth={2} />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-rose-600 active:scale-95"
              >
                <LogOut className="h-4 w-4" strokeWidth={2.5} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="relative z-10 -mt-12 mx-auto max-w-5xl px-6 md:px-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Left Column: Personal Information */}
          <div className="lg:col-span-7">
            <div className="rounded-[40px] border border-slate-100 bg-white p-8 shadow-[0_4px_32px_rgba(17,24,39,0.06)] md:p-10">
              <h2 className="mb-6 text-xl font-black text-slate-900">Personal Information</h2>
              <div className="divide-y divide-slate-50">
                <InfoRow label="Full Name" value={`${user.firstName} ${user.lastName}`} icon={User} />
                <InfoRow label="Email Address" value={user.email} icon={Mail} />
                <InfoRow label="Mobile Number" value={user.mobile} icon={Phone} />
                <InfoRow label="Username" value={user.userName} icon={AtSign} />
                <InfoRow label="Gender" value={user.gender || "Not Specified"} icon={User} />
                <InfoRow 
                  label="Member Since" 
                  value={new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })} 
                  icon={Calendar} 
                />
              </div>
            </div>
          </div>

          {/* Right Column: Quick Stats & Navigation */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Account Status Card */}
            <div className="overflow-hidden rounded-[40px] border border-slate-100 bg-white shadow-[0_4px_32px_rgba(17,24,39,0.06)]">
              <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Account Security</h3>
                <Shield className="h-5 w-5 text-slate-400" />
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <Shield className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Identity Verification</p>
                      <p className="text-xs font-semibold text-slate-500">{user.isVerified ? "Verified User" : "Pending Verification"}</p>
                    </div>
                  </div>
                  {user.isVerified ? (
                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-amber-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <Shield className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">User Role</p>
                      <p className="text-xs font-semibold text-slate-500">{user.role || "Standard Explorer"}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase text-indigo-700">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Quick Links */}
            <div className="grid grid-cols-1 gap-4">
              <QuickLink href="/bookings" label="My Bookings" icon={Package} color="bg-orange-50" />
              <QuickLink href="/cart" label="My Cart" icon={CreditCard} color="bg-pink-50" />
              <QuickLink href="/custom-requests" label="Custom Trips" icon={Heart} color="bg-rose-50" />
              <QuickLink href="/profile/blogs" label="My Blogs" icon={BookOpenText} color="bg-fuchsia-50" />
              <QuickLink href="/" label="Explore More" icon={Package} color="bg-indigo-50" />
            </div>

            {/* Refer & Earn Banner */}
            <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-r from-pink-500 to-rose-500 p-8 text-white">
              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-widest text-white/80">Refer & Earn</p>
                <h3 className="mt-2 text-xl font-black">Invite friends & get ₹500 off</h3>
                <button className="mt-5 rounded-full bg-white px-6 py-3 text-xs font-black text-rose-500 shadow-lg active:scale-95">
                  Share Now
                </button>
              </div>
              <div className="absolute -right-4 -top-4 opacity-20">
                <CreditCard className="h-32 w-32" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

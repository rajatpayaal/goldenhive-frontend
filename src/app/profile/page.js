"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-20 text-center">
        <h1 className="text-3xl font-black text-slate-900">My Profile</h1>
        <p className="mt-4 text-slate-600">Checking your login status...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-20 text-center">
        <h1 className="text-3xl font-black text-slate-900">My Profile</h1>
        <p className="mt-4 text-slate-600">Please log in to view your profile.</p>
        <Link href="/" className="mt-6 inline-flex rounded-2xl bg-emerald-500 px-6 py-3 text-white font-bold hover:bg-emerald-600">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Profile Info */}
        <div className="rounded-3xl border border-black/10 bg-white p-6">
          <h2 className="text-lg font-black text-slate-900 mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600">First Name</label>
              <p className="mt-1 text-slate-900 font-semibold">{user.firstName}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">Last Name</label>
              <p className="mt-1 text-slate-900 font-semibold">{user.lastName}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">Email</label>
              <p className="mt-1 text-slate-900 font-semibold">{user.email}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">Mobile</label>
              <p className="mt-1 text-slate-900 font-semibold">{user.mobile}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">Username</label>
              <p className="mt-1 text-slate-900 font-semibold">{user.userName}</p>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="rounded-3xl border border-black/10 bg-white p-6">
          <h2 className="text-lg font-black text-slate-900 mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600">Role</label>
              <p className="mt-1 text-slate-900 font-semibold">{user.role}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">Gender</label>
              <p className="mt-1 text-slate-900 font-semibold">{user.gender || "Not specified"}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">Account Status</label>
              <p className="mt-1">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  user.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {user.isVerified ? "Verified" : "Not Verified"}
                </span>
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">Member Since</label>
              <p className="mt-1 text-slate-900 font-semibold">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link href="/" className="inline-flex rounded-2xl bg-emerald-500 px-6 py-3 text-white font-bold hover:bg-emerald-600">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

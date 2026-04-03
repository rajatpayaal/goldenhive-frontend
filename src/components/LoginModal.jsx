"use client";

import React, { useState } from 'react';
import { apiService } from '../services/api.service';

export function LoginModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    email: "",
    phone: "",
    password: "",
    role: "USER"
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (formData.phone.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    // Auto-generate a userName if omitted
    const finalData = { ...formData };
    if (!finalData.userName) {
      finalData.userName = formData.email.split('@')[0] + Math.floor(Math.random() * 1000);
    }

    const { ok, data, error: apiError } = await apiService.registerUser(finalData);
    
    setLoading(false);
    
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setStep(1);
        onClose();
      }, 2500);
    } else {
      setError(apiError || data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-5 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_18px_45px_rgba(2,6,23,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-xl font-black text-slate-900 hover:bg-slate-50"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="bg-gradient-to-br from-slate-950 to-slate-900 px-8 py-7 text-white">
          <div className="text-2xl font-black tracking-tight">GoldenHive</div>
          <div className="mt-1 text-sm font-semibold text-white/80">Premium Travels</div>
        </div>

        <div className="px-8 py-7">
          {success ? (
            <div className="py-10 text-center">
              <div className="text-5xl">🎉</div>
              <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-900">Welcome Aboard!</h2>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                Your account has been successfully created.
              </p>
            </div>
          ) : step === 1 ? (
            <>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Enter your mobile number</h2>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                If you don't have an account yet, we'll create one for you.
              </p>
              
              {error && (
                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-800">
                  {error}
                </div>
              )}

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3">
                  <div className="shrink-0 rounded-xl bg-slate-50 px-3 py-2 text-sm font-extrabold text-slate-700">
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="Enter mobile number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    autoFocus
                  />
                </div>
                <button
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-4 text-base font-black text-white shadow-[0_14px_30px_rgba(16,185,129,0.30)] hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleNext}
                  disabled={formData.phone.length < 5}
                >
                  Continue
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Complete Registration</h2>
              <p className="mt-2 text-sm font-semibold text-slate-600">Please provide your details below.</p>
              
              {error && (
                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-800">
                  {error}
                </div>
              )}

              <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="fullName"
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />

                <input
                  type="email"
                  name="email"
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />

                <input
                  type="password"
                  name="password"
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                  placeholder="Create a Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    className="col-span-1 inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-4 text-sm font-black text-slate-900 hover:bg-slate-50"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="col-span-2 inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(16,185,129,0.30)] hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? "Registering..." : "Sign Up"}
                  </button>
                </div>
              </form>
            </>
          )}

          {!success && (
            <div className="mt-7 border-t border-black/5 pt-5 text-center text-xs font-semibold text-slate-500">
              By continuing, you agree to our{" "}
              <a className="font-black text-slate-700 hover:text-emerald-700" href="#!">
                Terms of Service
              </a>{" "}
              &{" "}
              <a className="font-black text-slate-700 hover:text-emerald-700" href="#!">
                Privacy Policy
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

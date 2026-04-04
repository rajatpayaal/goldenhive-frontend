"use client";

import React, { useState } from "react";
import {
  loginAction,
  registerUserAction,
  resendOtpAction,
  verifyOtpAction,
} from "../actions/auth.actions";

export function LoginModal({ isOpen, onClose }) {
  const [mode, setMode] = useState("register"); // register | login
  const [step, setStep] = useState(1); // register steps: 1 -> phone, 2 -> details, 3 -> otp
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const title = (() => {
    if (mode === "login") return "Log In";
    if (step === 3) return "Verify OTP";
    if (step === 2) return "Complete Registration";
    return "Enter your mobile number";
  })();

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinue = () => {
    const mobile = String(formData.phone || "").trim();
    if (mobile.length < 10) {
      setError("Please enter a valid mobile number.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.userName ||
      !formData.email ||
      !formData.password ||
      !String(formData.phone || "").trim()
    ) {
      setError("All fields are mandatory.");
      setLoading(false);
      return;
    }

    const mobile = String(formData.phone || "").trim();
    if (mobile.length < 10) {
      setError("Please enter a valid mobile number.");
      setLoading(false);
      return;
    }

    const payload = {
      mobile,
      password: formData.password,
      email: formData.email,
      userName: formData.userName,
      firstName: formData.firstName,
      lastName: formData.lastName,
    };

    const { ok, data } = await registerUserAction(payload);

    setLoading(false);

    if (ok) {
      // Backend sends OTP on register; move to verify step.
      setOtp("");
      setStep(3);
    } else {
      setError(data?.message || data?.error || "Registration failed. Please try again.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const otpValue = String(otp || "").trim();
    if (otpValue.length < 4) {
      setError("Please enter the OTP.");
      setLoading(false);
      return;
    }

    const { ok, data } = await verifyOtpAction({
      email: formData.email,
      otp: otpValue,
    });
    setLoading(false);

    if (ok) {
      // Token is stored in HttpOnly cookie by the Next.js route handler.
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setMode("register");
        setStep(1);
        setOtp("");
        setFormData({
          firstName: "",
          lastName: "",
          userName: "",
          email: "",
          phone: "",
          password: "",
        });
        onClose();
      }, 1200);
    } else {
      setError(data?.message || data?.error || "OTP verification failed.");
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);
    const { ok, data } = await resendOtpAction({ email: formData.email });
    setLoading(false);
    if (!ok) {
      setError(data?.message || data?.error || "Could not resend OTP.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.email || !formData.password) {
      setError("Please enter email and password.");
      setLoading(false);
      return;
    }

    const { ok, data } = await loginAction({
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setMode("register");
        setStep(1);
        setOtp("");
        setFormData({
          firstName: "",
          lastName: "",
          userName: "",
          email: "",
          phone: "",
          password: "",
        });
        onClose();
      }, 900);
    } else {
      setError(data?.message || data?.error || "Login failed.");
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
              <div className="text-5xl">✓</div>
              <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-900">You are logged in</h2>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                Session cookie has been saved.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">{title}</h2>
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    {mode === "login"
                      ? "Enter your credentials to continue."
                      : step === 3
                        ? `We sent an OTP to ${formData.email || "your email"}.`
                        : step === 2
                          ? "Please provide your details below."
                          : "If you don't have an account yet, we'll create one for you."}
                  </p>
                </div>

                <div className="inline-flex rounded-2xl border border-black/10 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setStep(1);
                      setOtp("");
                      setError(null);
                    }}
                    className={[
                      "rounded-xl px-4 py-2 text-sm font-black transition",
                      mode !== "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
                    ].join(" ")}
                  >
                    Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setStep(1);
                      setOtp("");
                      setError(null);
                    }}
                    className={[
                      "rounded-xl px-4 py-2 text-sm font-black transition",
                      mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
                    ].join(" ")}
                  >
                    Log In
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-800">
                  {error}
                </div>
              )}

              {mode === "login" ? (
                <form className="mt-6 space-y-3" onSubmit={handleLogin}>
                  <input
                    type="email"
                    name="email"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    autoFocus
                    required
                  />

                  <input
                    type="password"
                    name="password"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-4 text-base font-black text-white shadow-[0_14px_30px_rgba(16,185,129,0.30)] hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Log In"}
                  </button>
                </form>
              ) : step === 1 ? (
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
                      required
                    />
                  </div>
                  <button
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-4 text-base font-black text-white shadow-[0_14px_30px_rgba(16,185,129,0.30)] hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handleContinue}
                    disabled={String(formData.phone || "").trim().length < 5}
                    type="button"
                  >
                    Continue
                  </button>
                </div>
              ) : step === 2 ? (
                <form className="mt-6 space-y-3" onSubmit={handleRegister}>
                  <input
                    type="text"
                    name="firstName"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    autoFocus
                    required
                  />

                  <input
                    type="text"
                    name="lastName"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />

                  <input
                    type="text"
                    name="userName"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                    placeholder="Username"
                    value={formData.userName}
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
                      disabled={loading}
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
              ) : (
                <form className="mt-6 space-y-3" onSubmit={handleVerifyOtp}>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="otp"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-center text-lg font-black tracking-widest text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    autoFocus
                    required
                  />

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-4 text-base font-black text-white shadow-[0_14px_30px_rgba(16,185,129,0.30)] hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify & Continue"}
                  </button>

                  <div className="flex items-center justify-between pt-1 text-xs font-semibold text-slate-600">
                    <button
                      type="button"
                      className="font-black text-slate-900 hover:text-emerald-700"
                      onClick={() => {
                        setOtp("");
                        setStep(2);
                      }}
                      disabled={loading}
                    >
                      Change email
                    </button>
                    <button
                      type="button"
                      className="font-black text-slate-900 hover:text-emerald-700"
                      onClick={handleResendOtp}
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                  </div>
                </form>
              )}
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

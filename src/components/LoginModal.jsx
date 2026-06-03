"use client";

import React, { useSyncExternalStore, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  loginAction,
  registerUserAction,
  resendOtpAction,
  verifyOtpAction,
  googleLoginAction,
} from "../actions/auth.actions";
import { useAuth } from "../hooks/useAuth";
import { countries } from "../utils/countries";

const inputClassName =
  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-[color:var(--gh-accent)]";

const passwordInputClassName =
  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-16 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-[color:var(--gh-accent)]";

const primaryButtonClassName =
  "gh-primary-btn flex w-full items-center justify-center px-5 py-4 text-base shadow-md disabled:cursor-not-allowed disabled:opacity-60";

export function LoginModal({ isOpen, onClose }) {
  const { setUser, refreshUser } = useAuth();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [mode, setMode] = useState("register");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    phone: "",
    dialCode: "+91",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetState = () => {
    setMode("register");
    setStep(1);
    setOtp("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError(null);
    setFieldErrors({});
    setFormData({
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      phone: "",
      dialCode: "+91",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    });
  };

  const closeModal = () => {
    resetState();
    setSuccess(false);
    onClose();
  };

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || !window?.google?.accounts?.id) {
      setError("Google Sign-In is not available right now.");
      return;
    }

    // Register mode pe phone validate karo pehle
    if (mode !== "login" && !isPhoneValid(formData.phone)) {
      setError("Please enter a valid mobile number before signing in with Google.");
      return;
    }

    setError(null);
    setGoogleLoading(true);

    // Mobile number — sirf signup pe pass karo
    const mobile = mode !== "login"
      ? `${formData.dialCode}${String(formData.phone || "").trim()}`
      : "";

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        try {
          const { ok, data } = await googleLoginAction(credential, mobile);
          if (ok) {
            let loggedInUser = data?.data?.user || data?.user || null;
            if (refreshUser) {
              try { const me = await refreshUser(); if (me) loggedInUser = me; } catch { /* ignore */ }
            }
            if (loggedInUser) setUser(loggedInUser);
            setSuccess(true);
            setTimeout(() => closeModal(), 900);
          } else {
            setError(data?.data?.error || data?.error || "Google Sign-In failed.");
          }
        } catch {
          setError("Google Sign-In failed. Please try again.");
        } finally {
          setGoogleLoading(false);
        }
      },
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isSkippedMoment() || notification.isDismissedMoment()) {
        setGoogleLoading(false);
      }
    });
  };

  if (!isOpen) return null;
  if (!mounted) return null;

  const title = (() => {
    if (mode === "login") return "Log In";
    if (step === 3) return "Verify OTP";
    if (step === 2) return "Complete Registration";
    return "Create Account";
  })();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      if (name === "password") {
        delete next.confirmPassword;
      }
      return next;
    });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    const disposableDomains = [
      "10minutemail.com",
      "guerrillamail.com",
      "mailinator.com",
      "temp-mail.org",
    ];
    const domain = email.split("@")[1]?.toLowerCase();
    if (disposableDomains.includes(domain)) {
      return "Please use a valid email address that can receive OTP.";
    }

    return null;
  };

  const validatePhone = (phone) => {
    const cleanPhone = String(phone || "").replace(/\s+/g, "");
    if (cleanPhone.length < 6 || cleanPhone.length > 15 || !/^\d+$/.test(cleanPhone)) {
      return "Please enter a valid mobile number.";
    }
    return null;
  };

  const isPhoneValid = (phone) => {
    const cleanPhone = String(phone || "").replace(/\s+/g, "");
    return /^\d{6,15}$/.test(cleanPhone);
  };

  const validatePassword = (password) => {
    if (!password || password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    return null;
  };

  const getRegistrationErrors = () => {
    const errors = {};
    const nameRegex = /^[a-zA-Z\s]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]+$/;

    if (!formData.firstName?.trim()) {
      errors.firstName = "First name is required.";
    } else if (!nameRegex.test(formData.firstName.trim())) {
      errors.firstName = "First name can only contain letters and spaces.";
    }

    if (!formData.lastName?.trim()) {
      errors.lastName = "Last name is required.";
    } else if (!nameRegex.test(formData.lastName.trim())) {
      errors.lastName = "Last name can only contain letters and spaces.";
    }

    if (!formData.userName?.trim()) {
      errors.userName = "Username is required.";
    } else if (!usernameRegex.test(formData.userName.trim())) {
      errors.userName = "Username can only contain letters, numbers, and underscores.";
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
      errors.email = emailError;
    }

    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      errors.phone = phoneError;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      errors.password = passwordError;
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.termsAccepted) {
      errors.termsAccepted = "Accept the terms and conditions to continue.";
    }

    return errors;
  };

  const isRegistrationFormValid = () => {
    const errors = getRegistrationErrors();
    return Object.values(errors).every((value) => !value);
  };

  const handleContinue = () => {
    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const errors = getRegistrationErrors();
    if (Object.values(errors).some(Boolean)) {
      setFieldErrors(errors);
      setError("Please fix the highlighted fields.");
      setLoading(false);
      return;
    }

    const mobile = `${formData.dialCode}${String(formData.phone || "").trim()}`;
    const payload = {
      mobile,
      password: formData.password,
      email: formData.email,
      userName: formData.userName,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
    };

    const { ok, data } = await registerUserAction(payload);
    setLoading(false);

    if (ok) {
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
      let verifiedUser = data?.user || data?.data || data || null;
      if (refreshUser) {
        try {
          const me = await refreshUser();
          if (me) verifiedUser = me;
        } catch {
          // Ignore and use response user fallback.
        }
      }
      if (verifiedUser) {
        setUser(verifiedUser);
      }
      setSuccess(true);
      setTimeout(() => {
        closeModal();
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

    let loggedInUser = data?.user || data?.data || data || null;
    if (ok && refreshUser) {
      try {
        const me = await refreshUser();
        if (me) loggedInUser = me;
      } catch {
        // Ignore and use response user fallback.
      }
    }

    if (loggedInUser) {
      setUser(loggedInUser);
    }

    setLoading(false);

    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        closeModal();
      }, 900);
    } else {
      setError(data?.message || data?.error || "Login failed.");
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm sm:p-5"
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-3xl border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(135deg,rgba(255,250,245,0.98),rgba(255,255,255,0.96))] shadow-[0_28px_70px_rgba(2,6,23,0.3)] sm:rounded-[2rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-xl font-black text-white backdrop-blur-sm hover:bg-white/20 sm:right-4 sm:top-4"
          onClick={closeModal}
          aria-label="Close"
          type="button"
        >
          {"\u00D7"}
        </button>

        <div className="bg-gh-navy px-4 py-5 text-white sm:px-8 sm:py-7">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.28em] text-white/80">
              Premium Access
            </div>
            <Image src="/logo-icon.svg" alt="GoldenHive" width={40} height={40} className="drop-shadow-lg" />
          </div>
          <div className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">GoldenHive</div>
          <div className="mt-1 text-sm font-semibold text-white/80">Sign in or create your travel account</div>
        </div>

        <div className="max-h-[calc(92vh-8.5rem)] overflow-y-auto px-4 py-5 sm:px-8 sm:py-7">
          {success ? (
            <div className="py-10 text-center">
              <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(90deg,var(--gh-accent),var(--gh-accent-strong))] text-3xl font-black text-white shadow-[0_18px_35px_rgba(255,79,138,0.22)]">
                {"\u2713"}
              </div>
              <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-900">You are logged in</h2>
              <p className="mt-2 text-sm font-semibold text-slate-600">Session cookie has been saved.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">
                    Welcome Back
                  </div>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                    {title}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm font-semibold text-slate-600">
                    {mode === "login"
                      ? "Enter your credentials to continue."
                      : step === 3
                        ? `We sent an OTP to ${formData.email || "your email"}.`
                        : step === 2
                          ? "Please provide your details below."
                          : "If you don't have an account yet, we'll create one for you."}
                  </p>
                </div>

                <div className="flex w-full shrink-0 rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] p-1 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setStep(1);
                      setOtp("");
                      setError(null);
                      setShowPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    className={[
                      "flex-1 rounded-full px-4 py-2 text-sm font-black transition sm:flex-none",
                      mode !== "login"
                        ? "gh-secondary-btn shadow-md"
                        : "text-slate-600 hover:text-slate-900",
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
                      setShowPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    className={[
                      "flex-1 rounded-full px-4 py-2 text-sm font-black transition sm:flex-none",
                      mode === "login"
                        ? "bg-[color:var(--gh-heading)] text-white shadow-md"
                        : "text-slate-600 hover:text-slate-900",
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
                <form className="mt-6 space-y-3" onSubmit={handleLogin} autoComplete="off">
                  <input
                    type="email"
                    name="email"
                    className={inputClassName}
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    autoComplete="off"
                    required
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className={passwordInputClassName}
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      autoComplete="off"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-[0.18em] text-slate-500 hover:text-slate-900"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  <button type="submit" className={primaryButtonClassName} disabled={loading}>
                    {loading ? "Logging in..." : "Log In"}
                  </button>
                </form>
              ) : step === 1 ? (
                <div className="mt-6 space-y-3">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-bold text-slate-900">
                      Enter your mobile number <span className="text-rose-500">*</span>
                    </label>
                    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3">
                      <div className="relative shrink-0" ref={countryDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                          className="flex h-[42px] items-center gap-1.5 rounded-xl bg-slate-50 px-3 text-sm font-extrabold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[color:var(--gh-accent)]"
                        >
                          <Image 
                            src={`https://flagcdn.com/w20/${(countries.find(c => c.dial_code === formData.dialCode) || countries[0]).code.toLowerCase()}.png`}
                            alt="flag"
                            width={20}
                            height={15}
                            className="object-contain"
                          />
                          {formData.dialCode}
                          <svg className={`h-4 w-4 text-slate-400 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        
                        {isCountryDropdownOpen && (
                          <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-64 overflow-y-auto rounded-xl border border-black/10 bg-white p-1 shadow-lg">
                            {countries.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, dialCode: c.dial_code }));
                                  setIsCountryDropdownOpen(false);
                                }}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                              >
                                <Image 
                                  src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                                  alt={c.code}
                                  width={20}
                                  height={15}
                                  className="object-contain"
                                />
                                <span className="font-semibold text-slate-700">{c.name}</span>
                                <span className="ml-auto font-bold text-slate-500">{c.dial_code}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        className="w-full border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                        placeholder="Mobile number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        autoComplete="off"
                        required
                      />
                    </div>
                  </div>
                  <button
                    className={primaryButtonClassName}
                    onClick={handleContinue}
                    disabled={!isPhoneValid(formData.phone)}
                    type="button"
                  >
                    Continue
                  </button>
                </div>
              ) : step === 2 ? (
                <form className="mt-6 space-y-4" onSubmit={handleRegister} autoComplete="off">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="mb-2 block text-sm font-bold text-slate-900">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        name="firstName"
                        className={inputClassName}
                        placeholder="Enter first name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        autoComplete="off"
                        required
                      />
                      {fieldErrors.firstName && (
                        <p className="mt-2 text-xs font-medium text-rose-600">{fieldErrors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="mb-2 block text-sm font-bold text-slate-900">
                        Last Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        name="lastName"
                        className={inputClassName}
                        placeholder="Enter last name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        autoComplete="off"
                        required
                      />
                      {fieldErrors.lastName && (
                        <p className="mt-2 text-xs font-medium text-rose-600">{fieldErrors.lastName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="userName" className="mb-2 block text-sm font-bold text-slate-900">
                        Username <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="userName"
                        type="text"
                        name="userName"
                        className={inputClassName}
                        placeholder="Choose a username"
                        value={formData.userName}
                        onChange={handleInputChange}
                        autoComplete="off"
                        required
                      />
                      {fieldErrors.userName && (
                        <p className="mt-2 text-xs font-medium text-rose-600">{fieldErrors.userName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-900">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        className={inputClassName}
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        autoComplete="off"
                        required
                      />
                      {fieldErrors.email && (
                        <p className="mt-2 text-xs font-medium text-rose-600">{fieldErrors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="password" className="mb-2 block text-sm font-bold text-slate-900">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          className={passwordInputClassName}
                          placeholder="Create a password"
                          value={formData.password}
                          onChange={handleInputChange}
                          autoComplete="off"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-[0.18em] text-slate-500 hover:text-slate-900"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      {fieldErrors.password && (
                        <p className="mt-2 text-xs font-medium text-rose-600">{fieldErrors.password}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="mb-2 block text-sm font-bold text-slate-900">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          className={passwordInputClassName}
                          placeholder="Re-enter your password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          autoComplete="off"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-[0.18em] text-slate-500 hover:text-slate-900"
                          aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        >
                          {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      {fieldErrors.confirmPassword && (
                        <p className="mt-2 text-xs font-medium text-rose-600">{fieldErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-black/10 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="terms"
                        name="termsAccepted"
                        checked={formData.termsAccepted}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, termsAccepted: e.target.checked }));
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.termsAccepted;
                            return next;
                          });
                        }}
                        className="mt-1 h-4 w-4 rounded border border-black/10 text-[color:var(--gh-accent)] focus:ring-[color:var(--gh-accent)]"
                        required
                      />
                      <label htmlFor="terms" className="text-sm text-slate-600">
                        I agree to the <span className="font-semibold text-slate-900">Terms and Conditions</span> and{" "}
                        <span className="font-semibold text-slate-900">Privacy Policy</span>.
                      </label>
                    </div>
                    {fieldErrors.termsAccepted && (
                      <p className="mt-2 text-xs font-medium text-rose-600">{fieldErrors.termsAccepted}</p>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
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
                      className="col-span-2 gh-secondary-btn flex items-center justify-center px-5 py-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={loading || !isRegistrationFormValid()}
                    >
                      {loading ? "Registering..." : "Sign Up"}
                    </button>
                  </div>
                </form>
              ) : (
                <form className="mt-6 space-y-3" onSubmit={handleVerifyOtp} autoComplete="off">
                  <input
                    type="text"
                    inputMode="numeric"
                    name="otp"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-center text-lg font-black tracking-widest text-slate-900 outline-none placeholder:text-slate-400 focus:border-[color:var(--gh-accent)]"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    autoComplete="off"
                    required
                  />

                  <button type="submit" className={primaryButtonClassName} disabled={loading}>
                    {loading ? "Verifying..." : "Verify & Continue"}
                  </button>

                  <div className="flex items-center justify-between pt-1 text-xs font-semibold text-slate-600">
                    <button
                      type="button"
                      className="font-black text-slate-900 hover:text-[color:var(--gh-accent)]"
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
                      className="font-black text-slate-900 hover:text-[color:var(--gh-accent)]"
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

          {/* Google Sign-In — Login pe always, Register Step 1 & 2 pe (not OTP step 3) */}
          {!success && step !== 3 && (
            <div className="mt-5">
              <div className="relative flex items-center">
                <div className="flex-1 border-t border-black/8" />
                <span className="mx-4 text-xs font-bold uppercase tracking-widest text-slate-400">or</span>
                <div className="flex-1 border-t border-black/8" />
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading || (mode !== "login" && step === 1 && !isPhoneValid(formData.phone))}
                className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {googleLoading ? (
                  <svg className="h-5 w-5 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                {googleLoading ? "Signing in with Google..." : "Continue with Google"}
              </button>
              {/* Hint on Register Step 1 when phone not filled yet */}
              {mode !== "login" && step === 1 && !isPhoneValid(formData.phone) && (
                <p className="mt-2 text-center text-xs font-semibold text-slate-400">
                  Enter your mobile number above to enable Google Sign-In
                </p>
              )}
            </div>
          )}

          {!success && (
            <div className="mt-7 border-t border-black/5 pt-5 text-center text-xs font-semibold text-slate-500">
              By continuing, you agree to our{" "}
              <a className="font-black text-slate-700 hover:text-[color:var(--gh-accent)]" href="#!">
                Terms of Service
              </a>{" "}
              &{" "}
              <a className="font-black text-slate-700 hover:text-[color:var(--gh-accent)]" href="#!">
                Privacy Policy
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

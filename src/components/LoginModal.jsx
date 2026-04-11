"use client";

import React, { useState } from "react";
import {
  loginAction,
  registerUserAction,
  resendOtpAction,
  verifyOtpAction,
} from "../actions/auth.actions";
import { useAuth } from "../hooks/useAuth";

export function LoginModal({ isOpen, onClose }) {
  const { setUser, refreshUser } = useAuth();
  const [mode, setMode] = useState("register"); // register | login
  const [step, setStep] = useState(1); // register steps: 1 -> phone, 2 -> details, 3 -> otp
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const title = (() => {
    if (mode === "login") return "Log In";
    if (step === 3) return "Verify OTP";
    if (step === 2) return "Complete Registration";
  })();

  if (!isOpen) return null;

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

  const handleContinue = () => {
    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }
    setError(null);
    setStep(2);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    // Check for common disposable email domains
    const disposableDomains = ['10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'temp-mail.org'];
    const domain = email.split('@')[1]?.toLowerCase();
    if (disposableDomains.includes(domain)) {
      return "Please use a valid email address that can receive OTP.";
    }

    return null;
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = String(phone || "").replace(/\s+/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return "Please enter a valid 10-digit mobile number starting with 6-9.";
    }
    return null;
  };

  const isPhoneValid = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = String(phone || "").replace(/\s+/g, '');
    return phoneRegex.test(cleanPhone);
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

    const mobile = String(formData.phone || "").trim();
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
      let verifiedUser = data?.user || data?.data || data || null;
      if (refreshUser) {
        try {
          const me = await refreshUser();
          if (me) verifiedUser = me;
        } catch {
          // ignore and fallback to response user, if any
        }
      }
      if (verifiedUser) {
        setUser(verifiedUser);
      }
      // Token is stored in HttpOnly cookie by the Next.js route handler.
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setMode("register");
        setStep(1);
        setOtp("");
        setShowPassword(false);
        setShowConfirmPassword(false);
        setFormData({
          firstName: "",
          lastName: "",
          userName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          termsAccepted: false,
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

    let loggedInUser = data?.user || data?.data || data || null;
    if (ok && refreshUser) {
      try {
        const me = await refreshUser();
        if (me) loggedInUser = me;
      } catch {
        // ignore and fallback to response user, if any
      }
    }

    if (loggedInUser) {
      setUser(loggedInUser);
    }

    setLoading(false);

    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setMode("register");
        setStep(1);
        setOtp("");
        setShowPassword(false);
        setShowConfirmPassword(false);
        setFormData({
          firstName: "",
          lastName: "",
          userName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          termsAccepted: false,
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
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_18px_45px_rgba(2,6,23,0.22)] max-h-[calc(100vh-3.5rem)]"
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

        <div className="px-8 py-7 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 7rem)' }}>
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
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 truncate">{title}</h2>
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

                <div className="flex-shrink-0 inline-flex rounded-2xl border border-black/10 bg-slate-50 p-1">
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
                      setShowPassword(false);
                      setShowConfirmPassword(false);
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

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-12 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-4 text-base font-black text-white shadow-[0_14px_30px_rgba(16,185,129,0.30)] hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={loading}
                  >
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
                      <div className="shrink-0 rounded-xl bg-slate-50 px-3 py-2 text-sm font-extrabold text-slate-700">
                        🇮🇳 +91
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        className="w-full border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                        placeholder="Mobile number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        autoFocus
                        required
                      />
                    </div>
                  </div>
                  <button
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-4 text-base font-black text-white shadow-[0_14px_30px_rgba(16,185,129,0.30)] hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handleContinue}
                    disabled={!isPhoneValid(formData.phone)}
                    type="button"
                  >
                    Continue
                  </button>
                </div>
              ) : step === 2 ? (
                <form className="mt-6 space-y-4" onSubmit={handleRegister}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-bold text-slate-900 mb-2">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        name="firstName"
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                        placeholder="Enter first name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        autoFocus
                        required
                      />
                      {fieldErrors.firstName && (
                        <p className="mt-2 text-xs font-medium text-rose-600">{fieldErrors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-bold text-slate-900 mb-2">
                        Last Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        name="lastName"
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                        placeholder="Enter last name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                      {fieldErrors.lastName && (
                        <p className="mt-2 text-xs font-medium text-rose-600">{fieldErrors.lastName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="userName" className="block text-sm font-bold text-slate-900 mb-2">
                        Username <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="userName"
                        type="text"
                        name="userName"
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                        placeholder="Choose a username"
                        value={formData.userName}
                        onChange={handleInputChange}
                        required
                      />
                      {fieldErrors.userName && (
                        <p className="mt-2 text-xs font-medium text-rose-600">{fieldErrors.userName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-slate-900 mb-2">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                      {fieldErrors.email && (
                        <p className="mt-2 text-xs font-medium text-rose-600">{fieldErrors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="password" className="block text-sm font-bold text-slate-900 mb-2">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-12 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                          placeholder="Create a password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                      {fieldErrors.password && (
                        <p className="mt-2 text-xs font-medium text-rose-600">{fieldErrors.password}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-900 mb-2">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-12 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                          placeholder="Re-enter your password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                          aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        >
                          {showConfirmPassword ? "🙈" : "👁️"}
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
                          setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }));
                          setFieldErrors(prev => {
                            const next = { ...prev };
                            delete next.termsAccepted;
                            return next;
                          });
                        }}
                        className="mt-1 h-4 w-4 rounded border border-black/10 text-emerald-500 focus:ring-emerald-500"
                        required
                      />
                      <label htmlFor="terms" className="text-sm text-slate-600">
                        I agree to the <span className="font-semibold text-slate-900">Terms and Conditions</span> and <span className="font-semibold text-slate-900">Privacy Policy</span>.
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
                      className="col-span-2 inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(16,185,129,0.30)] hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={loading || !isRegistrationFormValid()}
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

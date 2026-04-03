import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr] md:items-start">
          <div>
            <div className="text-xl font-black tracking-tight text-slate-900">GoldenHive</div>
            <div className="mt-2 text-sm font-semibold text-slate-600">
              by Local Experts
            </div>
            <p className="mt-5 max-w-md text-sm font-medium leading-7 text-slate-600">
              Discover premium tours and experiences with transparent pricing and trusted support.
            </p>
          </div>

          <div className="grid gap-3 text-sm font-semibold text-slate-700">
            <a className="w-fit hover:text-emerald-700" href="#!">Terms & Conditions</a>
            <a className="w-fit hover:text-emerald-700" href="#!">Privacy Policy</a>
            <a className="w-fit hover:text-emerald-700" href="#!">Contact Us</a>
            <a className="w-fit hover:text-emerald-700" href="#!">List your activities</a>
          </div>

          <div className="rounded-3xl border border-black/5 bg-slate-50 p-6">
            <div className="text-sm font-extrabold uppercase tracking-wider text-slate-600">
              Get the app
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                <svg viewBox="0 0 100 100" fill="none" stroke="#0f172a" strokeWidth="4">
                  <rect x="10" y="10" width="30" height="30" />
                  <rect x="60" y="10" width="30" height="30" />
                  <rect x="10" y="60" width="30" height="30" />
                  <rect x="50" y="50" width="10" height="10" />
                  <rect x="70" y="70" width="20" height="20" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-black text-slate-900">Scan to download</div>
                <div className="mt-1 text-xs font-semibold text-slate-500">
                  iOS & Android
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-black/5 pt-7 md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-medium leading-6 text-slate-500">
            By accessing this page, you confirm that you have read, understood, and agreed to our Terms of Service, Cookie Policy, Privacy Policy, and Content Guidelines. All rights reserved.
          </p>

          <div className="flex items-center gap-3 text-slate-600">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/5 bg-slate-50">💬</span>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/5 bg-slate-50">🌐</span>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/5 bg-slate-50">📷</span>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/5 bg-slate-50">▶️</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

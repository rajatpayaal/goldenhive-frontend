"use client";

export default function Loader({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-3xl p-8 text-center shadow-2xl shadow-slate-950/20">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        <div>
          <p className="text-lg font-black text-slate-900">{message}</p>
          <p className="mt-2 text-sm text-slate-600">Please wait while the app loads.</p>
        </div>
      </div>
    </div>
  );
}

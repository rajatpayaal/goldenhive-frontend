"use client";

import { Share2 } from "lucide-react";

export default function ShareBlogButton({ title, text, url }) {
  const handleShare = async () => {
    const shareData = {
      title: title || "GoldenHive Blogs",
      text: text || "Check out this amazing blog!",
      url: url || window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error sharing:", err);
      }
    }
  };

  return (
    <div className="mt-10 mb-8 flex justify-center border-t border-slate-100 pt-8 px-4 md:px-8">
      <button 
        onClick={handleShare}
        className="flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-[color:var(--gh-accent)] py-4 text-[15px] font-bold text-white shadow-[0_4px_20px_rgba(225,29,72,0.3)] transition hover:opacity-90 active:scale-95 md:max-w-md md:py-4 md:text-base"
      >
        <Share2 className="h-5 w-5" strokeWidth={2.5} />
        Share this Blog
      </button>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HomeHeroSearch } from "@/components/HomeHeroSearch";
import { ArrowRight } from "lucide-react";

const isVideoUrl = (url) => {
  if (!url) return false;
  return /\.mp4(\?.*)?$/i.test(url);
};

const resolveHref = (banner) => {
  const raw = banner?.redirectType;
  if (!raw) return null;
  if (typeof raw === "string") return raw;
  return null;
};

export function BannerSlider({ banners }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  return (
    <>


      <div className="px-4 pt-4 md:px-0 md:pt-0">
        <section className="relative z-10 min-h-[280px] w-full overflow-hidden rounded-[2rem] bg-gh-plum shadow-[0_18px_45px_rgba(2,6,23,0.12)] md:min-h-[420px] md:rounded-none lg:min-h-[480px]">
          {banners.map((banner, index) => (
            <div
              key={banner._id}
              className={[
                "absolute inset-0 transition-opacity duration-700 ease-out",
                index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none",
              ].join(" ")}
            >
            {isVideoUrl(banner.imageUrl) ? (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${banner.fallbackImageUrl || ""})` }}
                />
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  src={banner.imageUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </>
            ) : (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${banner.imageUrl})` }}
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/88 via-slate-950/60 to-slate-950/25" />

            <div className="relative">
              <div className="mx-auto max-w-6xl px-5 h-full">
                {/* Search bar — top of banner, hidden on mobile since it's below */}
                <div className="hidden pt-20 sm:pt-24 lg:pt-28 md:block">
                  <HomeHeroSearch />
                </div>

                {/* Hero text + CTAs — bottom of banner */}
                <div className="flex h-full flex-col justify-end pb-8 text-white sm:pb-12">
                  <p className="inline-flex w-fit items-center rounded-full bg-[#5D32D9] px-3 py-1 text-[10px] font-bold text-white shadow-sm">
                    {banner.seoTitle || "COLLECTION"}
                  </p>

                  <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-white drop-shadow-[0_8px_24px_rgba(15,23,42,0.55)] sm:text-5xl lg:text-6xl">
                    {banner.title}
                  </h1>
                  <p className="mt-4 max-w-2xl text-base font-semibold text-white/95 drop-shadow-[0_6px_18px_rgba(15,23,42,0.45)] sm:text-lg">
                    {banner.description}
                  </p>

                  {resolveHref(banner) && (
                    <div className="mt-7 flex flex-wrap gap-3">
                      <Link
                        href={resolveHref(banner)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gh-gold px-6 py-4 text-base font-black text-gh-plum shadow-[0_14px_30px_rgba(244,178,41,0.35)] hover:bg-gh-gold2"
                      >
                        {banner.heroCtaText || banner.ctaText || "Explore"}
                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                      </Link>
                      <Link
                        href="/tour-packages"
                        className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-base font-black text-white backdrop-blur hover:bg-white/15"
                      >
                        View Packages
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {banners.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 px-5">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  className={[
                    "h-1.5 rounded-full transition-all",
                    idx === currentIndex ? "w-4 bg-gh-gold" : "w-1.5 bg-white",
                  ].join(" ")}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      </div>
      <div className="px-4 py-4 md:hidden">
        <HomeHeroSearch />
      </div>


    </>
  );
}

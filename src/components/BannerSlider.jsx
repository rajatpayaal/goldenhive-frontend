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
      <div className="mx-auto w-full max-w-6xl px-5 pb-4 pt-24 md:hidden">
        <div className="rounded-[1.75rem] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
          <HomeHeroSearch />
        </div>
      </div>

      <section className="relative z-10 min-h-[340px] w-full overflow-hidden bg-gh-plum shadow-[0_18px_45px_rgba(2,6,23,0.12)] sm:min-h-[420px] lg:min-h-[480px]">
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
              <div className="mx-auto max-w-6xl px-5">
                <div className="flex min-h-[340px] flex-col justify-end pb-10 pt-20 text-white sm:min-h-[420px] sm:pb-12 sm:pt-24 lg:min-h-[480px] lg:pt-32">
                  <p className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-wider backdrop-blur">
                    {banner.seoTitle || "GoldenHive"}
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
          <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-2 px-5">
            {banners.map((_, idx) => (
              <button
                key={idx}
                className={[
                  "h-2.5 rounded-full transition-all",
                  idx === currentIndex ? "w-10 bg-white" : "w-2.5 bg-white/50 hover:bg-white/70",
                ].join(" ")}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      <div className="relative z-40 hidden md:block">
        <div className="mx-auto -mt-10 w-full max-w-6xl px-5 lg:-mt-12">
          <div className="rounded-[1.75rem] bg-gradient-to-r from-[#fff8df] via-[#f7dc8a] to-[#fff3c4] p-[1px] shadow-[0_24px_48px_rgba(180,138,24,0.22)]">
            <div className="rounded-[calc(1.75rem-1px)] bg-[linear-gradient(180deg,rgba(255,252,244,0.96),rgba(255,248,225,0.92))] backdrop-blur-sm">
              <HomeHeroSearch />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

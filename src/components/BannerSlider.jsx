"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HomeHeroSearch } from "@/components/HomeHeroSearch";
import { ArrowRight, ShieldCheck, CheckCircle2, Copy, Clock, Mountain } from "lucide-react";
import Image from "next/image";
import { decodeS3Url } from "../lib/s3url";

function CampaignTimer({ endDate, className }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!endDate) return;
    const calculateTimeLeft = () => {
      const difference = new Date(endDate) - new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className={`bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-2.5 sm:px-6 sm:py-3 text-white shadow-lg ${className || ""}`}>
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider opacity-90">
        <Clock className="h-3 w-3" /> Offer Ends In
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center">
          <span className="text-lg sm:text-xl font-black leading-none">{String(timeLeft.days).padStart(2, "0")}</span>
          <span className="mt-0.5 text-[8px] font-bold uppercase tracking-wider opacity-80">Days</span>
        </div>
        <span className="text-lg sm:text-xl font-bold opacity-50">:</span>
        <div className="flex flex-col items-center">
          <span className="text-lg sm:text-xl font-black leading-none">{String(timeLeft.hours).padStart(2, "0")}</span>
          <span className="mt-0.5 text-[8px] font-bold uppercase tracking-wider opacity-80">Hrs</span>
        </div>
        <span className="text-lg sm:text-xl font-bold opacity-50">:</span>
        <div className="flex flex-col items-center">
          <span className="text-lg sm:text-xl font-black leading-none">{String(timeLeft.minutes).padStart(2, "0")}</span>
          <span className="mt-0.5 text-[8px] font-bold uppercase tracking-wider opacity-80">Mins</span>
        </div>
        <span className="text-lg sm:text-xl font-bold opacity-50">:</span>
        <div className="flex flex-col items-center">
          <span className="text-lg sm:text-xl font-black leading-none text-rose-200">{String(timeLeft.seconds).padStart(2, "0")}</span>
          <span className="mt-0.5 text-[8px] font-bold uppercase tracking-wider opacity-80">Secs</span>
        </div>
      </div>
    </div>
  );
}

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
  const items = banners || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState({});

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopied((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  useEffect(() => {
    if (!items || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <>


      <div className="w-full pb-8">
        <section className="relative mx-auto z-10 min-h-[360px] w-full bg-gh-plum shadow-gh-medium md:min-h-[500px] lg:min-h-[580px]">
          {items.map((banner, index) => (
            <div
              key={banner._id}
              className={[
                "absolute inset-0 overflow-hidden transition-opacity duration-700 ease-out",
                index === currentIndex ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0",
              ].join(" ")}
            >
              <>
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

                {banner.campaignId ? (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/75 to-white/40 lg:to-transparent lg:from-white/95 lg:via-rose-50/90" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/88 via-slate-950/60 to-slate-950/25" />
                )}

                {banner.campaignId ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-transparent to-transparent z-0 lg:hidden" />
                    <div className="relative z-10 flex h-full w-full max-w-3xl flex-col justify-center px-6 sm:px-10 lg:px-14 pb-28 pt-8 lg:pt-0 lg:pb-0">
                      
                      <div className="lg:hidden mb-6 self-start -ml-2">
                         <CampaignTimer endDate={banner.campaignId.endDate} className="rounded-2xl border border-rose-400/30 scale-90 origin-left" />
                      </div>

                      <div className="mb-4 lg:mb-6 inline-flex items-center gap-2 self-start rounded-r-full bg-gradient-to-r from-rose-500 to-rose-600 py-1.5 pl-3 pr-4 lg:py-2 lg:pl-4 lg:pr-6 text-white shadow-lg -ml-6 sm:-ml-10 lg:-ml-14">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-[10px] lg:text-xs font-black tracking-[0.2em] uppercase">Mega Offer</span>
                      </div>

                      <h2 className="text-2xl font-black leading-[1.1] tracking-tight text-slate-900 sm:text-4xl lg:text-6xl drop-shadow-sm">
                        {banner.campaignId.title.split(" ").map((word, i) => {
                          if (!isNaN(word) || word.toLowerCase() === "offer" || word.toLowerCase() === "yatra") {
                            return <span key={i} className="text-rose-600"> {word}</span>;
                          }
                          return " " + word;
                        })}
                      </h2>
                      <p className="mt-4 text-base font-bold text-slate-700 sm:text-xl flex items-center gap-2">
                        <span className="h-px w-8 bg-amber-500"></span>
                        {banner.campaignId.subtitle}
                      </p>

                      {/* Discount Section */}
                      <div className="mt-8 flex flex-col items-start gap-1">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Get Flat</span>
                        <div className="flex items-end gap-2 lg:gap-3">
                          <div className="flex items-baseline gap-1 text-rose-500">
                            <span className="text-5xl sm:text-[5rem] font-black leading-none tracking-tighter">{banner.campaignId.discountPercent}%</span>
                            <span className="text-xl sm:text-2xl font-black uppercase tracking-wider">Off</span>
                          </div>
                        </div>
                        <span className="mt-1 text-[13px] font-bold text-slate-600">
                          On All {banner.campaignId.title.includes("Char Dham") ? "Char Dham" : ""} Packages
                        </span>
                      </div>

                      <div className="mt-8 flex flex-wrap items-center gap-4">
                        <div className="inline-flex items-center gap-4 rounded-2xl border border-rose-100 bg-white/80 p-2 pr-5 shadow-sm backdrop-blur-md">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                            <span className="text-xl font-black">%</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Use Code:</span>
                            <span className="text-lg font-black text-rose-600">{banner.campaignId.couponCode}</span>
                          </div>
                          <button
                            onClick={() => handleCopy(banner.campaignId.couponCode, banner.campaignId._id)}
                            className="ml-3 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-all hover:bg-rose-100 active:scale-95 z-20 relative"
                          >
                            {copied[banner.campaignId._id] ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                          </button>
                        </div>

                        <Link
                          href={banner.campaignId.targetUrl || "/tour-packages"}
                          className="group hidden lg:flex items-center gap-3 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 py-4 pl-8 pr-4 text-white shadow-xl shadow-rose-500/30 transition-all hover:scale-105 active:scale-95 z-20 relative"
                        >
                          <span className="text-lg font-black">{banner.campaignId.ctaText || "Book Now"}</span>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition group-hover:bg-white/30">
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        </Link>
                      </div>
                    </div>

                    <div className="hidden lg:block absolute right-0 top-0 z-20">
                       <CampaignTimer endDate={banner.campaignId.endDate} className="rounded-bl-[2rem] border-l border-b border-rose-400/30" />
                    </div>

                    {banner.campaignId.linkedPackages && banner.campaignId.linkedPackages.length > 0 && typeof banner.campaignId.linkedPackages[0] === 'object' && (
                      <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/85 px-4 py-3 backdrop-blur-xl sm:px-8 border-t border-rose-100/50">
                        <div className="flex items-center gap-4 overflow-x-auto pb-2 pt-1 no-scrollbar sm:gap-6 relative z-30 pointer-events-auto">
                          {banner.campaignId.linkedPackages.map((pkg) => (
                            <Link
                              key={pkg._id}
                              href={`/packages/${pkg.basic?.slug || pkg._id}`}
                              className="group flex w-[280px] shrink-0 items-center gap-3 rounded-2xl bg-white p-2.5 shadow-sm transition hover:shadow-md border border-rose-50"
                            >
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                                {pkg.images?.primary?.url ? (
                                  <Image
                                    src={decodeS3Url(pkg.images.primary.url)}
                                    alt={pkg.basic?.name || "Package"}
                                    fill
                                    className="object-cover transition duration-500 group-hover:scale-110"
                                  />
                                ) : (
                                  <Mountain className="absolute inset-0 m-auto h-6 w-6 text-slate-300" />
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <h4 className="truncate text-xs font-black text-slate-800">{pkg.basic?.name}</h4>
                                {pkg.basic?.tagline && (
                                  <p className="truncate text-[10px] font-semibold text-slate-500">{pkg.basic?.tagline}</p>
                                )}
                                <span className="mt-1 flex items-center gap-1 text-[9px] font-bold text-rose-500 uppercase tracking-wider">
                                  View Package <ArrowRight className="h-3 w-3" />
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="relative h-full z-10">
                    <div className="mx-auto max-w-6xl px-5 h-full">
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
                          <div className="mt-7 flex flex-wrap gap-3 pointer-events-auto">
                            <Link
                              href={resolveHref(banner)}
                              className="gh-primary-btn inline-flex items-center justify-center gap-2 px-6 py-3 text-sm"
                            >
                              {banner.heroCtaText || banner.ctaText || "Explore Packages"}
                              <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                            <Link
                              href="/tour-packages"
                              className="inline-flex items-center justify-center rounded-full border border-white bg-transparent px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                            >
                              View All Packages
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            </div>
          ))}

        {items.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 px-5 z-30">
              {items.map((_, idx) => (
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
          
          {/* Search bar overlapping the bottom edge on desktop */}
          <div className="hidden md:block absolute -bottom-7 left-1/2 w-full max-w-2xl -translate-x-1/2 px-4 z-20">
            <HomeHeroSearch />
          </div>
        </section>
      </div>
      <div className="relative z-50 px-4 py-4 md:hidden">
        <HomeHeroSearch />
      </div>


    </>
  );
}

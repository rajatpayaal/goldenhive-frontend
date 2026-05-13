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
    <div className={`flex flex-col items-center justify-center rounded-xl lg:rounded-2xl bg-black/40 backdrop-blur-md p-2 lg:p-4 shadow-xl border border-white/10 ${className}`}>
      <div className="flex items-center gap-1 lg:gap-1.5 text-[7px] lg:text-[10px] text-pink-300 font-bold uppercase tracking-widest mb-1.5 lg:mb-2 text-center leading-tight">
        <Clock className="h-2 w-2 lg:h-3 lg:w-3" /> Offer Ends In
      </div>
      <div className="flex items-center gap-1.5 lg:gap-5">
        <div className="flex flex-col items-center">
          <span className="text-sm lg:text-3xl font-black text-white leading-none">{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="text-[6px] lg:text-[9px] font-bold text-pink-300 uppercase mt-0.5 lg:mt-1 tracking-wider">Days</span>
        </div>
        <span className="text-[#d91656] font-black text-sm lg:text-xl -mt-2 lg:-mt-4">:</span>
        <div className="flex flex-col items-center">
          <span className="text-sm lg:text-3xl font-black text-white leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-[6px] lg:text-[9px] font-bold text-pink-300 uppercase mt-0.5 lg:mt-1 tracking-wider">Hrs</span>
        </div>
        <span className="text-[#d91656] font-black text-sm lg:text-xl -mt-2 lg:-mt-4">:</span>
        <div className="flex flex-col items-center">
          <span className="text-sm lg:text-3xl font-black text-white leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-[6px] lg:text-[9px] font-bold text-pink-300 uppercase mt-0.5 lg:mt-1 tracking-wider">Mins</span>
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

  const hasCampaign = items.some(b => b.campaignId);
  const containerHeightClass = hasCampaign
    ? "min-h-[720px] md:min-h-[500px] lg:min-h-[640px]"
    : "min-h-[500px] md:min-h-[500px] lg:min-h-[600px]";

  return (
    <>


      <div className="w-full pb-0 md:pb-8">
        <section className={`relative mx-auto z-10 w-full bg-gh-plum shadow-gh-medium ${containerHeightClass}`}>
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
                  <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/50 to-transparent" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent lg:bg-gradient-to-r lg:from-slate-950/90 lg:via-slate-950/50 lg:to-transparent" />
                )}

                {banner.campaignId ? (
                  <>
                    {/* Background Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a0b16] via-[#2a1025]/80 to-transparent lg:bg-gradient-to-r lg:from-[#1a0b16]/90 lg:via-[#1a0b16]/60 lg:to-transparent z-0" />

                    <div className="relative z-10 flex h-full w-full flex-col justify-start lg:justify-center px-4 sm:px-10 lg:px-14 pb-8 pt-6 lg:pt-0 lg:pb-0 overflow-y-auto no-scrollbar lg:overflow-visible pt-safe">

                      <div className="max-w-3xl w-full mx-auto lg:mx-0 mt-2 lg:mt-0">

                        {/* Badge */}
                        <div className="mb-3 lg:mb-4 inline-flex items-center gap-2 rounded-full bg-[#d91656] py-1.5 px-3 lg:px-4 text-white shadow-lg border border-pink-400/30">
                          <Mountain className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                          <span className="text-[9px] lg:text-[10px] font-black tracking-widest uppercase">{banner.campaignId.title}</span>
                        </div>

                        {/* Title */}
                        <h2 className="text-[3rem] sm:text-5xl lg:text-[4.5rem] font-black leading-[1.05] tracking-tight text-white drop-shadow-lg uppercase font-sans">
                          {banner.campaignId.title.split(" ").map((word, i) => {
                            if (!isNaN(word) || word.toLowerCase() === "offer" || word.toLowerCase() === "yatra") {
                              return <span key={i} className="text-[#d91656]"> {word}</span>;
                            }
                            return " " + word;
                          })}
                        </h2>

                        {/* Subtitle */}
                        <p className="mt-1 lg:mt-3 text-[11px] sm:text-lg lg:text-xl font-bold text-[#ffb703] uppercase tracking-wide">
                          {banner.campaignId.subtitle || "Limited Period Spiritual Journey Discount"}
                        </p>

                        {/* Description */}
                        <p className="mt-3 lg:mt-4 text-[10px] sm:text-sm lg:text-base text-white/90 leading-relaxed max-w-xl hidden lg:block">
                          {banner.campaignId.description || "Experience the divine journey with exclusive discounts on Kedarnath, Badrinath, Gangotri & Yamunotri. Enjoy premium stays, comfortable transport, experienced guides & hassle-free spiritual travel for your family."}
                        </p>
                        <p className="mt-2 text-[10px] text-white/90 leading-relaxed block lg:hidden">
                          {banner.campaignId.description?.substring(0, 150) + "..." || "Experience the divine journey with exclusive discounts. Enjoy premium stays, comfortable transport, and hassle-free spiritual travel."}
                        </p>

                        {/* 3 Action Boxes */}
                        <div className="mt-4 lg:mt-6 flex flex-row items-stretch justify-between lg:justify-start lg:gap-4 w-full">
                          {/* 15% OFF */}
                          <div className="flex flex-col items-center justify-center rounded-xl lg:rounded-2xl bg-gradient-to-br from-[#d91656] to-[#9a0f3d] p-2 sm:p-4 text-white shadow-xl border border-pink-500/30 w-[28%] lg:w-auto lg:min-w-[100px]">
                            <Mountain className="h-4 w-4 lg:h-6 lg:w-6 mb-0.5 lg:mb-1 opacity-80" />
                            <div className="flex items-start leading-none">
                              <span className="text-2xl lg:text-4xl font-black">{banner.campaignId.discountPercent}%</span>
                            </div>
                            <span className="text-[8px] lg:text-sm font-black uppercase tracking-widest mt-0.5 lg:mt-1">Off*</span>
                          </div>

                          {/* Coupon Code */}
                          <div className="flex flex-col items-center justify-center rounded-xl lg:rounded-2xl bg-white p-2 sm:p-4 shadow-xl border-2 border-dashed border-pink-200 relative w-[38%] lg:w-auto lg:min-w-[180px]">
                            <div className="absolute -left-1.5 lg:-left-3 top-1/2 -translate-y-1/2 w-3 h-3 lg:w-6 lg:h-6 rounded-full bg-[#1a0b16]"></div>
                            <div className="absolute -right-1.5 lg:-right-3 top-1/2 -translate-y-1/2 w-3 h-3 lg:w-6 lg:h-6 rounded-full bg-[#1a0b16]"></div>
                            <span className="text-[7px] lg:text-[10px] font-bold text-[#d91656] uppercase tracking-widest mb-0.5 lg:mb-1">Coupon Code</span>
                            <span className="text-sm lg:text-2xl font-black text-[#d91656] uppercase tracking-widest leading-none">{banner.campaignId.couponCode}</span>
                          </div>

                          {/* Timer */}
                          <CampaignTimer endDate={banner.campaignId.endDate} className="w-[30%] lg:w-auto lg:min-w-[160px]" />
                        </div>

                        {/* Book Now Button */}
                        <div className="mt-4 lg:mt-8 w-full lg:w-auto flex flex-col items-center lg:items-start">
                          <Link href={banner.campaignId.targetUrl || "/tour-packages"} className="w-full lg:w-auto group flex items-center justify-between lg:justify-center gap-4 lg:gap-6 rounded-full bg-[#d91656] py-3 lg:py-4 pl-6 lg:pl-8 pr-2 lg:pr-4 text-white shadow-[0_8px_30px_rgba(217,22,86,0.3)] transition-transform hover:scale-[1.02] active:scale-[0.98]">
                            <span className="text-sm lg:text-lg font-black tracking-widest uppercase flex-1 text-center sm:text-left">Book Now</span>
                            <div className="flex h-8 w-8 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#d91656] shadow-sm transition-transform group-hover:translate-x-1">
                              <ArrowRight className="h-4 w-4 lg:h-6 lg:w-6" />
                            </div>
                          </Link>

                          {/* Value Props */}
                          <div className="w-full lg:w-auto flex items-center justify-between lg:justify-start gap-1 lg:gap-6 text-[7px] sm:text-[10px] lg:text-xs text-white/90 font-bold uppercase tracking-wider px-1 lg:px-0 mt-4 lg:mt-6">
                            <div className="flex flex-col lg:flex-row items-center gap-1 lg:gap-2 text-center lg:text-left"><ShieldCheck className="h-3.5 w-3.5 lg:h-5 lg:w-5 text-[#d91656] lg:text-pink-400 mb-0.5 lg:mb-0" /> Best Price<br className="lg:hidden" /> Guarantee</div>
                            <div className="flex flex-col lg:flex-row items-center gap-1 lg:gap-2 text-center lg:text-left"><Clock className="h-3.5 w-3.5 lg:h-5 lg:w-5 text-[#d91656] lg:text-pink-400 mb-0.5 lg:mb-0" /> 24/7 Customer<br className="lg:hidden" /> Support</div>
                            <div className="flex flex-col lg:flex-row items-center gap-1 lg:gap-2 text-center lg:text-left"><CheckCircle2 className="h-3.5 w-3.5 lg:h-5 lg:w-5 text-[#d91656] lg:text-pink-400 mb-0.5 lg:mb-0" /> Family & Group<br className="lg:hidden" /> Friendly</div>
                          </div>
                        </div>

                        {/* Mobile White Card: Visit The Sacred Char Dham */}
                        {/* <div className="block lg:hidden mt-6 bg-white rounded-t-[2rem] rounded-b-xl shadow-2xl pb-6 px-4 pt-5 border-t border-pink-100 relative overflow-hidden -mx-4 w-[calc(100%+2rem)]">
                               <div className="flex items-center justify-center w-full gap-2 mb-5">
                                  <span className="h-px w-8 bg-pink-200"></span>
                                  <span className="text-[10px] text-pink-400">◈</span>
                                  <span className="text-[10px] font-black text-[#d91656] uppercase tracking-widest text-center">Visit The Sacred Char Dham</span>
                                  <span className="text-[10px] text-pink-400">◈</span>
                                  <span className="h-px w-8 bg-pink-200"></span>
                               </div>
                               <div className="flex items-center justify-between gap-1">
                                 {['Yamunotri', 'Gangotri', 'Kedarnath', 'Badrinath'].map((dest, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 min-w-[60px]">
                                       <div className="h-12 w-12 rounded-full border border-pink-200 flex items-center justify-center bg-pink-50 shadow-sm text-[#d91656]">
                                          <Mountain className="h-5 w-5" /> 
                                       </div>
                                       <span className="text-[8px] font-black text-slate-800 uppercase tracking-wider text-center">{dest}</span>
                                    </div>
                                 ))}
                               </div>
                            </div> */}

                        {/* Mobile Explore Our Top Packages Slider */}
                        {banner.campaignId.linkedPackages && banner.campaignId.linkedPackages.length > 0 && typeof banner.campaignId.linkedPackages[0] === 'object' && (
                          <div className="block lg:hidden bg-white mt-4 pb-8 -mx-4 px-4 w-[calc(100%+2rem)]">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-[11px] font-black text-[#1a0b16] uppercase tracking-widest">
                                Explore Our Top Packages
                              </h3>
                            </div>
                            <div className="flex items-stretch gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
                              {banner.campaignId.linkedPackages.map((pkg, i) => {
                                const tags = ["BEST SELLER", "DELUXE", "HILL RETREAT", "ADVENTURE"];
                                return (
                                  <Link key={pkg._id} href={`/packages/${pkg.basic?.slug || pkg._id}`} className="flex flex-col min-w-[160px] max-w-[160px] bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden shrink-0">
                                    <div className="relative h-28 w-full bg-slate-100">
                                      {pkg.images?.primary?.url && (
                                        <Image src={decodeS3Url(pkg.images.primary.url)} alt={pkg.basic?.name || "Package"} fill className="object-cover" />
                                      )}
                                      <div className="absolute top-2 left-0 bg-[#d91656] text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-r-md">
                                        {tags[i % tags.length]}
                                      </div>
                                    </div>
                                    <div className="p-3 flex flex-col flex-grow">
                                      <h4 className="text-[10px] font-black text-slate-800 leading-snug line-clamp-2">{pkg.basic?.name}</h4>
                                      <p className="text-[8px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{pkg.basic?.tagline}</p>
                                      <div className="mt-auto pt-2 flex items-baseline gap-1">
                                        <span className="text-[9px] text-slate-500 font-bold">From</span>
                                        <span className="text-[11px] font-black text-[#d91656]">{pkg.price ? `₹${pkg.price}` : "₹24,999"}</span>
                                      </div>
                                    </div>
                                  </Link>
                                )
                              })}
                            </div>

                            {/* <div className="mt-2 bg-pink-50 border border-pink-100 rounded-xl p-3 flex items-center justify-between shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-[#d91656]">
                                  <Mountain className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[#d91656] text-[10px] font-black uppercase tracking-widest leading-none">Special discounts</span>
                                  <span className="text-slate-700 text-[9px] font-bold mt-0.5">on all packages</span>
                                </div>
                              </div>
                              <Link href="/offers" className="bg-[#d91656] text-white rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
                                View <ArrowRight className="h-3 w-3 bg-white text-[#d91656] rounded-full p-0.5" />
                              </Link>
                            </div> */}
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Desktop Destinations & Linked Packages (Right Side) */}
                    {banner.campaignId.linkedPackages && banner.campaignId.linkedPackages.length > 0 && typeof banner.campaignId.linkedPackages[0] === 'object' && (
                      <div className="hidden lg:flex absolute right-14 top-1/2 -translate-y-1/2 flex-col items-end z-20 w-[450px]">

                        {/* Desktop Mega Offer Badge */}
                        <div className="relative mb-10 mr-10 flex flex-col items-center justify-center w-32 h-32 rounded-full bg-[#d91656] text-white shadow-[0_10px_40px_rgba(217,22,86,0.4)] border-[6px] border-white/20 hover:scale-105 transition-transform">
                          <div className="absolute inset-0 rounded-full border border-white/30 border-dashed m-2"></div>
                          <div className="flex items-center gap-1 mb-1.5 relative z-10"><span className="text-pink-200 text-[8px]">★</span><span className="text-pink-100 text-[8px]">★</span><span className="text-pink-200 text-[8px]">★</span></div>
                          <span className="text-base font-black tracking-[0.2em] uppercase leading-none mb-1 relative z-10">Mega</span>
                          <span className="text-lg font-black tracking-[0.1em] uppercase leading-none mb-1 relative z-10">Summer</span>
                          <span className="text-base font-black tracking-[0.2em] uppercase leading-none relative z-10">Offer</span>
                          <div className="flex items-center gap-1.5 mt-2 relative z-10"><span className="h-px w-4 bg-pink-300"></span><span className="text-pink-200 text-[8px]">★</span><span className="h-px w-4 bg-pink-300"></span></div>
                        </div>

                        {/* Desktop Destinations Icons */}
                        <div className="flex items-center justify-end gap-5 w-full mb-8 pr-4">
                          {['Yamunotri', 'Gangotri', 'Kedarnath', 'Badrinath'].map((dest, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
                              <div className="h-16 w-16 rounded-t-full border border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-md transition-colors shadow-lg relative overflow-hidden">
                                <Mountain className="h-8 w-8 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="bg-white text-[#d91656] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-md">
                                {dest}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Desktop Explore Top Packages Container */}
                        <div className="bg-white rounded-2xl shadow-2xl p-5 w-full">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-[#1a0b16] uppercase tracking-widest flex items-center gap-2">
                              Explore Packages <span className="text-pink-300">❖</span>
                            </h3>
                            <Link href="/tour-packages" className="text-[#d91656] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                              View All <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                          <div className="flex items-stretch gap-4 overflow-x-auto pb-2 no-scrollbar">
                            {banner.campaignId.linkedPackages.slice(0, 3).map((pkg, i) => {
                              const tags = ["BEST SELLER", "DELUXE", "HILL RETREAT"];
                              return (
                                <Link key={pkg._id} href={`/packages/${pkg.basic?.slug || pkg._id}`} className="flex flex-col min-w-[180px] max-w-[180px] bg-white rounded-xl shadow border border-slate-100 overflow-hidden shrink-0 hover:shadow-lg transition-all">
                                  <div className="relative h-24 w-full bg-slate-100">
                                    {pkg.images?.primary?.url && (
                                      <Image src={decodeS3Url(pkg.images.primary.url)} alt={pkg.basic?.name || "Package"} fill className="object-cover" />
                                    )}
                                    <div className="absolute top-2 left-0 bg-[#d91656] text-white text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-r-md">
                                      {tags[i % tags.length]}
                                    </div>
                                  </div>
                                  <div className="p-3 flex flex-col flex-grow">
                                    <h4 className="text-[11px] font-black text-slate-800 leading-snug line-clamp-2">{pkg.basic?.name}</h4>
                                    <div className="mt-auto pt-2 flex items-baseline gap-1">
                                      <span className="text-[9px] text-slate-500 font-bold">From</span>
                                      <span className="text-xs font-black text-[#d91656]">{pkg.price ? `₹${pkg.price}` : "₹24,999"}</span>
                                    </div>
                                  </div>
                                </Link>
                              )
                            })}
                          </div>
                        </div>

                      </div>
                    )}
                  </>
                ) : (
                  <div className="relative h-full z-10">
                    <div className="mx-auto max-w-6xl px-5 h-full">
                      {/* Hero text + CTAs — bottom of banner on mobile, centered on desktop */}
                      <div className="flex h-full flex-col justify-end pb-12 sm:pb-16 lg:justify-center lg:pb-0 max-w-2xl">
                        <p className="inline-flex w-fit items-center rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-[10px] sm:text-xs font-bold tracking-widest uppercase text-white shadow-sm ring-1 ring-white/30">
                          {banner.seoTitle || "FEATURED COLLECTION"}
                        </p>

                        <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-md leading-[1.15]">
                          {banner.title}
                        </h1>
                        <p className="mt-4 text-base sm:text-lg font-medium text-white/90 drop-shadow-sm leading-relaxed max-w-xl">
                          {banner.description}
                        </p>

                        {resolveHref(banner) && (
                          <div className="mt-8 flex flex-wrap items-center gap-4 pointer-events-auto">
                            <Link
                              href={resolveHref(banner)}
                              className="group inline-flex h-12 sm:h-14 items-center justify-center gap-2 rounded-full bg-white px-6 sm:px-8 text-sm sm:text-base font-bold text-slate-900 shadow-xl transition-all hover:scale-105 active:scale-95"
                            >
                              {banner.heroCtaText || banner.ctaText || "Explore Packages"}
                              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                            </Link>
                            <Link
                              href="/tour-packages"
                              className="inline-flex h-12 sm:h-14 items-center justify-center rounded-full border-2 border-white/40 bg-black/20 backdrop-blur-md px-6 sm:px-8 text-sm sm:text-base font-bold text-white transition-all hover:bg-white/20 hover:border-white/80"
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
      <div className="relative z-50 px-4 py-2 md:hidden">
        <HomeHeroSearch />
      </div>


    </>
  );
}

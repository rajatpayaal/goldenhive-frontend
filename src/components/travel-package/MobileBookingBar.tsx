// Fixed overlapping bottom nav on mobile by shifting upward to bottom-[76px], and increased button touch targets to 44px (h-11)
"use client";

import { MessageCircle, PhoneCall, Sparkles } from "lucide-react";

import type { TravelPackage } from "@/components/travel-package/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/money";

export function MobileBookingBar({ data, className }: { data: TravelPackage; className?: string }) {
  const priceLabel = formatMoney(data.pricing.finalPrice, data.pricing.currency);

  return (
    <div className={cn("fixed inset-x-0 bottom-[76px] md:bottom-0 z-40 lg:hidden", className)}>
      <div className="mx-auto max-w-6xl px-4 pb-4">
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">
                {data.basic.name}
              </div>
              <div className="text-xs text-slate-600">
                {priceLabel} /person • taxes included
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="success"
                className="h-11 w-11"
                aria-label="WhatsApp"
                onClick={() =>
                  window.open(
                    `https://wa.me/${data.cta.whatsapp.replace(/\D/g, "")}`,
                    "_blank"
                  )
                }
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-11 w-11"
                aria-label="Call"
                onClick={() => (window.location.href = `tel:${data.cta.call}`)}
              >
                <PhoneCall className="h-4 w-4" />
              </Button>
              <Button variant="gradient" className="h-11 px-4">
                <Sparkles className="h-4 w-4" />
                Book
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


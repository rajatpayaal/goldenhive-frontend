"use client";

import * as React from "react";
import {
  BadgeCheck,
  Lock,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import type { TravelPackage } from "@/components/travel-package/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { formatMoney } from "@/lib/money";

export function BookingCard({ data }: { data: TravelPackage }) {
  const [persons, setPersons] = React.useState(2);

  const pricePerPerson = data.pricing.finalPrice;
  const priceLabel = formatMoney(pricePerPerson, data.pricing.currency);

  const seatsLeft = data.seatsLeft ?? 5;

  return (
    <Card className="overflow-hidden rounded-2xl shadow-lg">
      <div className="bg-gradient-to-r from-pink-500 to-orange-500 px-4 py-2 text-center text-xs font-semibold text-white">
        Only {seatsLeft} seats left — book today
      </div>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate">{data.basic.name}</CardTitle>
            <p className="mt-1 text-sm text-slate-600">
              {data.basic.durationDays}D/{data.basic.nights}N • {persons}{" "}
              {persons === 1 ? "Person" : "Persons"}
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Taxes included
          </div>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-900">
              {priceLabel}
            </div>
            <div className="text-xs text-slate-500">/person • includes taxes</div>
          </div>

          <div className="w-28">
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Group size
            </label>
            <Select
              value={String(persons)}
              onChange={(e) => setPersons(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full">
            Add to Cart
          </Button>
          <Button variant="gradient" className="w-full">
            <Sparkles className="h-4 w-4" />
            Book Now
          </Button>
        </div>

        <Button
          variant="success"
          className="w-full"
          onClick={() => window.open(`https://wa.me/${data.cta.whatsapp.replace(/\D/g, "")}`, "_blank")}
        >
          <MessageCircle className="h-4 w-4" />
          Chat on WhatsApp
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => (window.location.href = `tel:${data.cta.call}`)}
        >
          <PhoneCall className="h-4 w-4" />
          Call Now
        </Button>

        <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-700">Why travelers trust us</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-600" />
              Secure booking & payment options
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Best price guarantee
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Verified partners & support
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-emerald-600" />
              Instant confirmation
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

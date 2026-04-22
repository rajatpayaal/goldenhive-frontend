"use client";

import * as React from "react";
import Image from "next/image";
import { Check, Users2 } from "lucide-react";

import type { VehicleOption } from "@/components/travel-package/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/money";

export function VehicleSelectorSection({
  vehicles,
  currency,
}: {
  vehicles: VehicleOption[];
  currency: string;
}) {
  const [selectedPersons, setSelectedPersons] = React.useState(2);
  const [selectedId, setSelectedId] = React.useState(vehicles[0]?.id ?? "");

  const selected = vehicles.find((v) => v.id === selectedId) ?? vehicles[0];
  const total = (selected?.pricePerPerson ?? 0) * selectedPersons;

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-emerald-200 bg-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-16 overflow-hidden rounded-xl border border-emerald-200 bg-white">
                {selected?.imageUrl ? (
                  <Image
                    src={selected.imageUrl}
                    alt={selected.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : null}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {selected?.name}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-700">
                  <Users2 className="h-4 w-4 text-emerald-700" />
                  {selected?.capacity}
                  <span className="text-slate-500">•</span>
                  {formatMoney(selected?.pricePerPerson ?? 0, currency)} /person
                </div>
              </div>
            </div>

            <Button variant="outline" className="border-emerald-200 bg-white">
              Change Vehicle
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Select group size & vehicle</CardTitle>
          <div className="w-32">
            <Select
              value={String(selectedPersons)}
              onChange={(e) => setSelectedPersons(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                <option key={n} value={n}>
                  {n} persons
                </option>
              ))}
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {vehicles.map((v) => {
              const isSelected = v.id === selectedId;
              const totalPrice = v.pricePerPerson * selectedPersons;
              return (
                <div
                  key={v.id}
                  className={cn(
                    "rounded-2xl border bg-white p-4 shadow-sm transition",
                    isSelected
                      ? "border-emerald-400 ring-2 ring-emerald-200"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="relative h-32 w-full overflow-hidden rounded-xl border border-slate-200">
                    <Image
                      src={v.imageUrl}
                      alt={v.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {v.name}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-600">
                        {v.capacity}
                      </div>
                    </div>
                    {v.savingsLabel ? (
                      <Badge variant="success" className="whitespace-nowrap">
                        <Check className="mr-1 h-3.5 w-3.5" />
                        {v.savingsLabel}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Price/person</span>
                      <span className="font-semibold text-slate-900">
                        {formatMoney(v.pricePerPerson, currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Total</span>
                      <span className="font-semibold text-slate-900">
                        {formatMoney(totalPrice, currency)}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="mt-4 w-full"
                    variant={isSelected ? "success" : "outline"}
                    onClick={() => setSelectedId(v.id)}
                  >
                    {isSelected ? "Selected" : "Select Vehicle"}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-700">
                Total price for <span className="font-semibold">{selectedPersons}</span>{" "}
                persons with{" "}
                <span className="font-semibold">{selected?.name}</span>
              </div>
              <div className="text-xl font-extrabold text-slate-900">
                {formatMoney(total, currency)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


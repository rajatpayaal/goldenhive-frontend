import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Bus,
  CalendarDays,
  Clock,
  Flag,
  Languages,
  MapPin,
  Mountain,
  UtensilsCrossed,
  Users,
} from "lucide-react";

import type { TravelPackage } from "@/components/travel-package/types";
import { BookingCard } from "@/components/travel-package/BookingCard";
import { GallerySection } from "@/components/travel-package/GallerySection";
import { MobileBookingBar } from "@/components/travel-package/MobileBookingBar";
import { OverviewSection } from "@/components/travel-package/OverviewSection";
import { VehicleSelectorSection } from "@/components/travel-package/VehicleSelectorSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/cn";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <Link
          href={`#${id}`}
          className="hidden text-xs font-semibold text-slate-500 hover:text-slate-900 sm:inline"
        >
          #{id}
        </Link>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function QuickInfoGrid({ info }: { info: TravelPackage["quickInfo"] }) {
  const items = [
    { label: "Pickup", value: info.pickup, icon: MapPin },
    { label: "Drop", value: info.drop, icon: Flag },
    { label: "Meals", value: info.meals, icon: UtensilsCrossed },
    { label: "Stay", value: info.stay, icon: BadgeCheck },
    { label: "Transport", value: info.transport, icon: Bus },
    { label: "Difficulty", value: info.difficulty, icon: Mountain },
    { label: "Timing", value: info.timing, icon: Clock },
    { label: "Best time", value: info.bestTime, icon: CalendarDays },
    { label: "Group size", value: info.groupSize, icon: Users },
    { label: "Language", value: info.language, icon: Languages },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <Card key={it.label} className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-slate-100 p-2 text-slate-900">
                <it.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-500">{it.label}</div>
                <div className="mt-1 truncate text-sm font-semibold text-slate-900">
                  {it.value}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Highlights({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((h) => (
        <Badge key={h} variant="success" className="rounded-full px-3 py-1 text-sm">
          {h}
        </Badge>
      ))}
    </div>
  );
}

function WhyChooseUs({ items }: { items: string[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.slice(0, 5).map((w, idx) => (
        <Card key={w} className="rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 to-orange-500 text-sm font-extrabold text-white">
                {idx + 1}
              </div>
              <div className="text-sm font-semibold text-slate-900">{w}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function InclusionsExclusions({ inclusions, exclusions }: { inclusions: string[]; exclusions: string[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Inclusions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-700">
            {inclusions.map((it) => (
              <li key={it} className="flex gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  ✓
                </span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Exclusions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-700">
            {exclusions.map((it) => (
              <li key={it} className="flex gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-50 text-rose-700">
                  ✕
                </span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function ItineraryTimeline({ days }: { days: TravelPackage["itinerary"] }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 h-full w-px bg-slate-200" />
      <div className="space-y-6">
        {days.map((d) => (
          <div key={d.day} className="relative pl-12">
            <div className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-xs font-extrabold text-white">
              D{d.day}
            </div>
            <Card className="rounded-2xl">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{d.title}</div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">
                      {d.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="rounded-full">
                      Meals: {d.meals}
                    </Badge>
                    <Badge variant="outline" className="rounded-full">
                      Stay: {d.stay}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

function LocationCard({ data }: { data: TravelPackage }) {
  const mapLink = data.location.mapUrl.replace("output=embed", "");
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Location</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-slate-700">{data.location.address}</div>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <iframe
            title="Map"
            src={data.location.mapUrl}
            className="h-44 w-full"
            loading="lazy"
          />
        </div>
        <Button asChild variant="outline" className="w-full">
          <a href={mapLink} target="_blank" rel="noreferrer">
            Open in Google Maps
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

function PackageDetailsCard({ details }: { details: string[] }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Package details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {details.map((d) => (
            <Badge key={d} variant="secondary" className="rounded-full">
              {d}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function NeedHelpCard({ data }: { data: TravelPackage }) {
  const wa = `https://wa.me/${data.cta.whatsapp.replace(/\D/g, "")}`;
  return (
    <Card className="rounded-2xl border-slate-200 bg-gradient-to-br from-white to-slate-50">
      <CardHeader>
        <CardTitle>Need help?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-700">
          Get quick answers on WhatsApp or talk to a trip expert.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="success">
            <a href={wa} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={`tel:${data.cta.call}`}>Call</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SidebarTravelInfo({ data }: { data: TravelPackage }) {
  const pairs: Array<{ label: string; value: string }> = [
    { label: "Pickup", value: data.quickInfo.pickup },
    { label: "Meals", value: data.quickInfo.meals },
    { label: "Stay", value: data.quickInfo.stay },
    { label: "Transport", value: data.quickInfo.transport },
    { label: "Best time", value: data.quickInfo.bestTime },
    { label: "Language", value: data.quickInfo.language },
  ];

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Travel info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pairs.map((p) => (
          <div key={p.label} className="flex items-start justify-between gap-3 text-sm">
            <span className="text-slate-600">{p.label}</span>
            <span className="text-right font-semibold text-slate-900">{p.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function TravelPackagePage({ data }: { data: TravelPackage }) {
  const heroHeight = "h-[540px] sm:h-[520px] lg:h-[520px]";

  return (
    <div className="relative">
      <div className={cn("absolute inset-x-0 top-0", heroHeight)}>
        <Image
          src={data.images.primary.url}
          alt={data.hero.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/55 to-slate-950/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(236,72,153,0.35),transparent_50%)]" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        <div className={cn("pt-12", heroHeight)} />

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="relative -mt-[520px] sm:-mt-[500px] lg:-mt-[500px] pb-10 pt-12">
              <div className="flex flex-wrap gap-2">
                {data.hero.badges.map((b) => (
                  <Badge
                    key={b}
                    className="rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur"
                    variant="outline"
                  >
                    {b}
                  </Badge>
                ))}
              </div>

              <h1 className="mt-5 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                {data.hero.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85">
                {data.hero.subtitle}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Badge
                  variant="success"
                  className="rounded-full bg-emerald-500/15 text-emerald-50 ring-1 ring-emerald-400/30"
                >
                  {data.basic.durationDays}D / {data.basic.nights}N
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full border-white/25 bg-white/10 text-white"
                >
                  {data.basic.destination}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full border-white/25 bg-white/10 text-white"
                >
                  {data.basic.tagline}
                </Badge>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="gradient" className="px-6">
                  <a href="#quick-info">Explore package</a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/25 bg-white/10 text-white hover:bg-white/15"
                >
                  <a href="#itinerary">View itinerary</a>
                </Button>
              </div>
            </div>

            <div className="space-y-10 pb-24 lg:pb-12">
              <Section id="quick-info" title="Quick info">
                <QuickInfoGrid info={data.quickInfo} />
              </Section>

              <Section id="overview" title="Overview">
                <OverviewSection overview={data.overview} />
              </Section>

              <Section id="highlights" title="Highlights">
                <Highlights items={data.highlights} />
              </Section>

              <Section id="why-choose-us" title="Why choose us">
                <WhyChooseUs items={data.whyChooseUs} />
              </Section>

              <Section id="vehicle" title="Select group size & vehicle">
                {data.vehicles?.length ? (
                  <VehicleSelectorSection vehicles={data.vehicles} currency={data.pricing.currency} />
                ) : (
                  <Card className="rounded-2xl">
                    <CardContent className="p-6 text-sm text-slate-600">
                      Vehicle options are not available for this package.
                    </CardContent>
                  </Card>
                )}
              </Section>

              <Section id="inclusions" title="Inclusions & exclusions">
                <InclusionsExclusions inclusions={data.inclusions} exclusions={data.exclusions} />
              </Section>

              <Section id="itinerary" title="Itinerary">
                <ItineraryTimeline days={data.itinerary} />
              </Section>

              <Section id="gallery" title="Gallery">
                <GallerySection images={data.images.gallery} />
              </Section>

              <Section id="travel-policies" title="Travel & policies">
                <Card className="rounded-2xl">
                  <CardContent className="p-6">
                    <Tabs defaultValue="travel">
                      <TabsList>
                        <TabsTrigger value="travel">Travel</TabsTrigger>
                        <TabsTrigger value="policies">Policies</TabsTrigger>
                      </TabsList>

                      <TabsContent value="travel">
                        <div className="grid gap-4 md:grid-cols-3">
                          <Card className="rounded-2xl border-slate-200">
                            <CardContent className="p-4">
                              <div className="text-xs font-semibold text-slate-500">
                                Best time
                              </div>
                              <div className="mt-1 text-sm font-semibold text-slate-900">
                                {data.quickInfo.bestTime}
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="rounded-2xl border-slate-200">
                            <CardContent className="p-4">
                              <div className="text-xs font-semibold text-slate-500">
                                Temperature
                              </div>
                              <div className="mt-1 text-sm font-semibold text-slate-900">
                                {data.travelPolicies?.temperature ?? "—"}
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="rounded-2xl border-slate-200">
                            <CardContent className="p-4">
                              <div className="text-xs font-semibold text-slate-500">
                                Clothing
                              </div>
                              <div className="mt-1 text-sm font-semibold text-slate-900">
                                {data.travelPolicies?.clothing ?? "—"}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      <TabsContent value="policies">
                        <ul className="space-y-2 text-sm text-slate-700">
                          {(data.travelPolicies?.policies ?? []).map((p) => (
                            <li key={p} className="flex gap-2">
                              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                                i
                              </span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </Section>

              <Section id="location" title="Location">
                <LocationCard data={data} />
              </Section>

              <Section id="package-details" title="Package details">
                {data.packageDetails?.length ? (
                  <PackageDetailsCard details={data.packageDetails} />
                ) : (
                  <Card className="rounded-2xl">
                    <CardContent className="p-6 text-sm text-slate-600">
                      No additional package tags available.
                    </CardContent>
                  </Card>
                )}
              </Section>

              <Section id="need-help" title="Need help?">
                <NeedHelpCard data={data} />
              </Section>
            </div>
          </div>

          <aside className="hidden lg:block lg:col-span-4">
            <div className="relative -mt-[520px] sm:-mt-[500px] lg:-mt-[500px] pt-12">
              <div className="sticky top-24 space-y-6">
              <BookingCard data={data} />
              <SidebarTravelInfo data={data} />
              <LocationCard data={data} />
              {data.packageDetails?.length ? <PackageDetailsCard details={data.packageDetails} /> : null}
              <NeedHelpCard data={data} />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <MobileBookingBar data={data} />
    </div>
  );
}

import "server-only";

import type { TravelPackage } from "@/components/travel-package/types";

function buildMock(slug: string): TravelPackage {
  const currency = "INR";
  const finalPrice = 23000;

  const titleSlug = slug
    .split("-")
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() + p.slice(1))
    .join(" ");

  return {
    basic: {
      name: `${titleSlug || "Kedarnath & Badrinath"} Premium Package`,
      tagline: "A divine journey of comfort, views, and seamless planning.",
      destination: "Uttarakhand",
      durationDays: 5,
      nights: 4,
      finalPrice,
      currency,
    },
    images: {
      primary: {
        url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2200&q=80",
      },
      gallery: [
        {
          url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80",
        },
        {
          url: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1400&q=80",
        },
        {
          url: "https://images.unsplash.com/photo-1500043357865-c6b8827edf4a?auto=format&fit=crop&w=1400&q=80",
        },
        {
          url: "https://images.unsplash.com/photo-1526481280695-3c687fd5432c?auto=format&fit=crop&w=1400&q=80",
        },
        {
          url: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1400&q=80",
        },
      ],
    },
    hero: {
      title: "Premium Uttarakhand Pilgrimage Escape",
      subtitle:
        "Handpicked stays, verified drivers, and a stress-free itinerary — built for comfort-first travelers.",
      badges: ["Top Rated", "Instant Confirmation", "Free Cancellation*", "Best Price"],
    },
    quickInfo: {
      pickup: "Dehradun / Haridwar",
      drop: "Dehradun / Haridwar",
      meals: "Breakfast + Dinner",
      stay: "Premium Hotels",
      transport: "AC SUV / Tempo",
      difficulty: "Easy",
      timing: "05:00 AM – 08:00 PM",
      duration: "5 Days",
      bestTime: "Apr – Jun, Sep – Nov",
      groupSize: "2 – 12 travelers",
      language: "Hindi / English",
      guide: "Optional Guide",
    },
    overview: {
      short:
        "A premium, conversion-focused package with the right balance of spiritual experience and modern comfort — ideal for families and first-timers.",
      long:
        "This curated itinerary covers scenic drives, priority-ready timings, and restful stays. You’ll get transparent pricing, verified partners, and a well-paced plan. Expect clean hotels, safe transport, and a dedicated support line for every step of the trip.",
    },
    itinerary: [
      {
        day: 1,
        title: "Pickup & Scenic Drive",
        description:
          "Meet your driver, quick briefing, and start the Himalayan drive with comfort breaks and photo stops.",
        meals: "Dinner",
        stay: "Premium hotel in Guptkashi",
      },
      {
        day: 2,
        title: "Temple Visit & Local Exploration",
        description:
          "Early start, guided temple visit window, and relaxed sightseeing based on crowd flow.",
        meals: "Breakfast + Dinner",
        stay: "Premium hotel in Kedarnath base",
      },
      {
        day: 3,
        title: "Hills, Views & Culture",
        description:
          "Comfort-paced day with viewpoints, cultural spots, and time to rest — no rush itinerary.",
        meals: "Breakfast + Dinner",
        stay: "Premium hotel in Badrinath",
      },
      {
        day: 4,
        title: "Return via Iconic Stops",
        description:
          "Drive back with curated stops for photos, snacks, and short walks. Optional local shopping.",
        meals: "Breakfast + Dinner",
        stay: "Premium hotel in Rudraprayag",
      },
      {
        day: 5,
        title: "Drop & Trip Wrap-up",
        description:
          "Smooth drop-off and a quick support check — leave with a clear trip summary and receipts.",
        meals: "Breakfast",
        stay: "—",
      },
    ],
    highlights: [
      "Premium stays with verified hygiene standards",
      "Comfort-first pacing with planned breaks",
      "Transparent pricing with taxes included",
      "WhatsApp support from pickup to drop",
      "Handpicked scenic stops for photos",
    ],
    whyChooseUs: [
      "Verified partners and real-time support",
      "No hidden charges — pay exactly what you see",
      "Comfort-optimized itinerary built by experts",
      "Trusted by thousands of travelers",
      "Easy reschedule and cancellation options",
    ],
    inclusions: [
      "Hotel accommodation (as per plan)",
      "Breakfast & dinner (as per itinerary)",
      "Private vehicle as selected",
      "Toll, parking & driver allowance",
      "24/7 trip assistance",
    ],
    exclusions: [
      "Any personal expenses",
      "Entry fees / local activities",
      "Lunch and snacks",
      "Anything not mentioned in inclusions",
    ],
    pricing: { finalPrice, currency },
    cta: { whatsapp: "+919999999999", call: "+919888888888" },
    location: {
      address: "GoldenHive Holidays, Dehradun, Uttarakhand, India",
      mapUrl:
        "https://www.google.com/maps?q=Dehradun%20Uttarakhand&output=embed",
    },
    seatsLeft: 5,
    packageDetails: [
      "Premium",
      "Family Friendly",
      "Private Vehicle",
      "Meals Included",
      "Support Included",
      "Flexible Dates",
    ],
    vehicles: [
      {
        id: "suv",
        name: "Premium SUV",
        capacity: "Up to 4",
        imageUrl:
          "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80",
        pricePerPerson: 23000,
        savingsLabel: "Best value",
      },
      {
        id: "tempo",
        name: "Tempo Traveller",
        capacity: "Up to 12",
        imageUrl:
          "https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=1200&q=80",
        pricePerPerson: 20500,
        savingsLabel: "Save 10%",
      },
      {
        id: "sedan",
        name: "Comfort Sedan",
        capacity: "Up to 3",
        imageUrl:
          "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80",
        pricePerPerson: 25000,
        savingsLabel: "Most premium",
      },
    ],
    travelPolicies: {
      temperature: "5°C – 22°C (seasonal)",
      clothing: "Warm layers, trekking shoes, rain cover, and sunscreen.",
      policies: [
        "Free cancellation up to 48 hours before pickup*",
        "Reschedule support subject to availability",
        "ID proof required for hotel check-in",
        "Pickup timing may shift based on road conditions",
      ],
    },
  };
}

export async function fetchTravelPackageBySlug(slug: string): Promise<TravelPackage> {
  // Example (replace with your backend):
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/packages/${slug}`, { cache: "no-store" })
  // if (!res.ok) throw new Error("Failed to fetch package")
  // return (await res.json()) as TravelPackage
  await new Promise((r) => setTimeout(r, 120));
  return buildMock(slug);
}


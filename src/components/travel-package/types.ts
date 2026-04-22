export type TravelPackageBasic = {
  name: string;
  tagline: string;
  destination: string;
  durationDays: number;
  nights: number;
  finalPrice: number;
  currency: string;
};

export type TravelPackageImage = { url: string };

export type TravelPackageHero = {
  title: string;
  subtitle: string;
  badges: string[];
};

export type TravelPackageQuickInfo = {
  pickup: string;
  drop: string;
  meals: string;
  stay: string;
  transport: string;
  difficulty: string;
  timing: string;
  duration: string;
  bestTime: string;
  groupSize: string;
  language: string;
  guide: string;
};

export type TravelPackageOverview = {
  short: string;
  long: string;
};

export type TravelPackageItineraryDay = {
  day: number;
  title: string;
  description: string;
  meals: string;
  stay: string;
};

export type TravelPackagePricing = {
  finalPrice: number;
  currency: string;
};

export type TravelPackageCTA = {
  whatsapp: string;
  call: string;
};

export type TravelPackageLocation = {
  address: string;
  mapUrl: string;
};

export type VehicleOption = {
  id: string;
  name: string;
  capacity: string;
  imageUrl: string;
  pricePerPerson: number;
  savingsLabel?: string;
};

export type TravelPolicies = {
  temperature: string;
  clothing: string;
  policies: string[];
};

export type TravelPackage = {
  basic: TravelPackageBasic;
  images: { primary: TravelPackageImage; gallery: TravelPackageImage[] };
  hero: TravelPackageHero;
  quickInfo: TravelPackageQuickInfo;
  overview: TravelPackageOverview;
  itinerary: TravelPackageItineraryDay[];
  highlights: string[];
  whyChooseUs: string[];
  inclusions: string[];
  exclusions: string[];
  pricing: TravelPackagePricing;
  cta: TravelPackageCTA;
  location: TravelPackageLocation;
  seatsLeft?: number;
  packageDetails?: string[];
  vehicles?: VehicleOption[];
  travelPolicies?: TravelPolicies;
};


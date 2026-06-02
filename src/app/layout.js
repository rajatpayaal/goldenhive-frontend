import { Poppins } from "next/font/google";
import Script from "next/script";
import "../styles/globals.css";
import { ReduxProvider } from "../providers/ReduxProvider";
import { ToastProvider } from "../components/ToastProvider";
import { HeaderServer } from "../components/HeaderServer";
import { Footer } from "../components/Footer";
import { apiService } from "../services/api.service";
import { ChatbotWidget } from "../components/ChatbotWidget";
import { MobileBottomNav } from "../components/MobileBottomNav";

const bodyFont = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const displayFont = Poppins({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      "https://goldenhiveholidays.in"
  ),
  title: {
    default: "GoldenHive Holidays | Premium Getaways & Curated Packages",
    template: "%s | GoldenHive Holidays",
  },
  description: "GoldenHive Holidays helps travelers discover curated tours, weekend escapes, and custom travel experiences across India.",
  openGraph: {
    title: "GoldenHive Holidays | Premium Getaways & Curated Packages",
    description: "GoldenHive Holidays helps travelers discover curated tours, weekend escapes, and custom travel experiences across India.",
    type: "website",
    siteName: "GoldenHive Holidays",
    images: [{ url: "/logo-full.svg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GoldenHive Holidays | Premium Getaways & Curated Packages",
    description: "GoldenHive Holidays helps travelers discover curated tours, weekend escapes, and custom travel experiences across India.",
    images: ["/logo-full.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }) {
  const [categories, footer] = await Promise.all([
    apiService.getCategories(),
    apiService.getFooter({ isActive: true }),
  ]);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GoldenHive Holidays",
    url: "https://goldenhiveholidays.in",
    logo: "https://goldenhiveholidays.in/logo.png",
    sameAs: [
      "https://www.instagram.com/goldenhiveholidays.official",
      "https://www.linkedin.com/company/golden-hive-holidays/",
      "https://youtube.com/@goldenhiveholidays",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+917505917525",
      contactType: "customer service",
      email: "info@goldenhiveholidays.in",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Rishikesh",
      addressRegion: "Uttarakhand",
      addressCountry: "IN",
    },
  };

  const travelAgencySchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "GoldenHive Holidays",
    url: "https://goldenhiveholidays.in",
    image: "https://goldenhiveholidays.in/logo.png",
    telephone: "+917505917525",
    email: "info@goldenhiveholidays.in",
    sameAs: [
      "https://www.instagram.com/goldenhiveholidays.official",
      "https://www.linkedin.com/company/golden-hive-holidays/",
      "https://youtube.com/@goldenhiveholidays",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Rishikesh",
      addressRegion: "Uttarakhand",
      addressCountry: "IN",
    },
  };

  const activeCategories = (categories || []).filter(
    (category) => category?.isActive !== false
  );

  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className={bodyFont.className}>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-VNZ4RVNQ66"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-VNZ4RVNQ66');
            `,
          }}
        />
        <ReduxProvider>
          <ToastProvider>
            <div className="min-h-screen flex flex-col">
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(organizationSchema),
                }}
              />
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(travelAgencySchema),
                }}
              />
              <HeaderServer categories={activeCategories} />
              <main className="flex-1 pb-20 md:pb-0">{children}</main>
              <Footer footer={footer} />
              <MobileBottomNav />
              <ChatbotWidget title="Help Center" />
            </div>
          </ToastProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

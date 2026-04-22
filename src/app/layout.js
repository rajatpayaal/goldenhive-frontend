import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "../styles/globals.css";
import { ReduxProvider } from "../providers/ReduxProvider";
import { ToastProvider } from "../components/ToastProvider";
import { HeaderServer } from "../components/HeaderServer";
import { Footer } from "../components/Footer";
import { apiService } from "../services/api.service";
import { ChatbotWidget } from "../components/ChatbotWidget";

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      "https://goldenhive-frontend.vercel.app"
  ),
  title: {
    default: "GoldenHive Holidays | Premium Getaways & Curated Packages",
    template: "%s | GoldenHive Holidays",
  },
  description: "GoldenHive Holidays helps travelers discover curated tours, weekend escapes, and custom travel experiences across India.",
};

export default async function RootLayout({ children }) {
  const [categories, footer] = await Promise.all([
    apiService.getCategories(),
    apiService.getFooter({ isActive: true }),
  ]);

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
        <ReduxProvider>
          <ToastProvider>
            <div className="min-h-screen flex flex-col">
              <HeaderServer categories={activeCategories} />
              <main className="flex-1">{children}</main>
              <Footer footer={footer} />
              <ChatbotWidget title="Help Center" />
            </div>
          </ToastProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

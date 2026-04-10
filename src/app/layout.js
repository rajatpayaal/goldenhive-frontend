import { Inter } from "next/font/google";
import "../styles/globals.css";
import { ReduxProvider } from "../providers/ReduxProvider";
import { ToastProvider } from "../components/ToastProvider";
import { HeaderServer } from "../components/HeaderServer";
import { Footer } from "../components/Footer";
import { apiService } from "../services/api.service";
import { ChatbotWidget } from "../components/ChatbotWidget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      "https://goldenhive-frontend.vercel.app"
  ),
  title: "GoldenHive Platform",
  description: "Modern travel and activity booking.",
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
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body className={inter.className}>
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

import { Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
<<<<<<< HEAD
  title: "GoldenHive Platform",
  description: "Modern travel and activity booking.",
=======
  title: "Golden Hive Holidays",
  description:
    "Golden Hive Holidays - Customized travel packages, adventure activities, and complete trip planning services. Char Dham, Uttarakhand tours, rafting, trekking, and more.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/golden-hive-logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
>>>>>>> d78f7d20e19cf20e41502ff195d18e01cdbb9e15
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

import { Montserrat, Playfair_Display } from "next/font/google";
import "../styles/globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata = {
  title: "Golden Hive Holidays",
  description: "Golden Hive Holidays – Customized travel packages, adventure activities, and complete trip planning services. Char Dham, Uttarakhand tours, rafting, trekking, and more.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}

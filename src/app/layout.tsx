import { Metadata } from "next";
import { Oswald, Funnel_Display, Fjalla_One, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import NextTopLoader from "nextjs-toploader";
import { Analytics } from "@vercel/analytics/next";

const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"] });
const funnelDisplay = Funnel_Display({ variable: "--font-funnel", subsets: ["latin"] });
const fjallaOne = Fjalla_One({ variable: "--font-fjalla", weight: "400", subsets: ["latin"] });
const plusJakarta = Plus_Jakarta_Sans({ variable: "--font-plus-jakarta", subsets: ["latin"] });


export const metadata: Metadata = {
  title: "BuildManager",
  description: "Manager portal for construction and projects",
};

import SafetyScreen from "@/components/SafetyScreen";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${oswald.variable} ${funnelDisplay.variable} ${fjallaOne.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--frame-bg)] text-[var(--foreground)] overflow-hidden">
        <NextTopLoader color="#8b5cf6" showSpinner={false} shadow={false} />
        <Providers>
          <SafetyScreen />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}


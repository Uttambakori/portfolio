import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
  weight: ["400"],
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAFAF8",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://uttambakori.com"),
  title: {
    default: "Uttam Bakori — Visual Designer",
    template: "%s — Uttam Bakori",
  },
  description:
    "Visual designer. Occasionally writes. Based somewhere beautiful, thinking about how things should feel.",
  openGraph: {
    title: "Uttam Bakori — Visual Designer",
    description:
      "Visual designer. Occasionally writes. Based somewhere beautiful, thinking about how things should feel.",
    type: "website",
    locale: "en_US",
    url: "https://uttambakori.com",
    siteName: "Uttam Bakori",
  },
  twitter: {
    card: "summary_large_image",
    title: "Uttam Bakori — Visual Designer",
    description: "Visual designer. Occasionally writes.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://uttambakori.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable}`}
    >
      <body className="bg-background text-primary font-sans antialiased">
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

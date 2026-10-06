export const runtime = "edge";

import type { Metadata, Viewport } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://revasy.pages.dev"),
  title: "Revasy | AI Google Reviews & Smart NFC Stands",
  description:
    "Turn in-store visits into 5-star Google reviews in 30 seconds with custom NFC & QR table stands and AI reply assistants by Revasy.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Revasy Reviews",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://revasy.pages.dev",
    siteName: "Revasy Review Assistant",
    title: "Revasy | AI Google Reviews & Smart NFC Stands",
    description:
      "Turn in-store visits into 5-star Google reviews in 30 seconds with custom NFC & QR table stands and AI reply assistants by Revasy.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Revasy | AI Google Reviews & Smart NFC Stands",
    description:
      "Turn in-store visits into 5-star Google reviews in 30 seconds with custom NFC & QR table stands and AI reply assistants by Revasy.",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable}`}>
      <body className="bg-canvas font-sans antialiased text-ink min-h-screen flex flex-col">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
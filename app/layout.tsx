
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
  title: "revasy | AI Google Reviews & Smart NFC Stands",
  description:
    "Turn in-store visits into 5-star Google reviews in 30 seconds with custom NFC & QR table stands and AI reply assistants by revasy.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "revasy Reviews",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/revasy-logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://revasy.widox.in",
    siteName: "revasy Review Assistant",
    title: "revasy | AI Google Reviews & Smart NFC Stands",
    description:
      "Turn in-store visits into 5-star Google reviews in 30 seconds with custom NFC & QR table stands and AI reply assistants by revasy.",
    images: [{ url: "/revasy-logo.png", width: 1200, height: 1200, alt: "revasy logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "revasy | AI Google Reviews & Smart NFC Stands",
    description:
      "Turn in-store visits into 5-star Google reviews in 30 seconds with custom NFC & QR table stands and AI reply assistants by revasy.",
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
    <html lang="en" className={`scroll-smooth ${inter.variable} ${bricolage.variable}`}>
      <body className="bg-canvas font-sans antialiased text-ink min-h-screen flex flex-col">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
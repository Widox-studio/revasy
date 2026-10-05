import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://widox.in"),
  title: "Widox Review Assistant | AI Google Reviews & NFC Stands",
  description:
    "Turn in-store visits into 5-star Google reviews in 30 seconds with custom NFC & QR table stands and AI reply assistants by Widox.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Widox Reviews",
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
    url: "https://widox.in",
    siteName: "Widox Review Assistant",
    title: "Widox Review Assistant | AI Google Reviews & NFC Stands",
    description:
      "Turn in-store visits into 5-star Google reviews in 30 seconds with custom NFC & QR table stands and AI reply assistants by Widox.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Widox Review Assistant | AI Google Reviews & NFC Stands",
    description:
      "Turn in-store visits into 5-star Google reviews in 30 seconds with custom NFC & QR table stands and AI reply assistants by Widox.",
  },
};

export const viewport: Viewport = {
  themeColor: "#fffaf0",
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
    <html lang="en">
      <body className="bg-canvas font-sans antialiased text-ink min-h-screen flex flex-col">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
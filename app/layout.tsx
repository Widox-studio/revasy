import type { Metadata, Viewport } from "next";
import "./globals.css";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: `${config.cafe.name} | Google Review Assistant`,
  description: `${config.cafe.name} - Turn your genuine dining experience into a polished Google review in seconds.`,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#1f1412",
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
      <body className="bg-crema font-sans antialiased text-espresso min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}

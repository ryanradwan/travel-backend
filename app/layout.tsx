import type { Metadata } from "next";
import "./globals.css";
import CookieBanner from "@/components/ui/CookieBanner";

export const metadata: Metadata = {
  title: {
    default: "TravelBackend.com — AI Operations for Travel Businesses",
    template: "%s — TravelBackend.com",
  },
  description: "AI-powered business operations built exclusively for US travel businesses. Build itineraries, research destinations, and publish tour packages in minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}

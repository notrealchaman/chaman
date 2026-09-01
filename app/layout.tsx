import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "PEAKLOOP — The Operating System for Modern Businesses",
    template: "%s | PEAKLOOP",
  },
  description: "Find the right tools. Connect your business. Reach your peak. Discover, compare and manage the software that powers your business.",
  keywords: ["SaaS marketplace", "business software", "CRM", "automation", "software comparison", "PEAKLOOP"],
  openGraph: {
    type: "website",
    siteName: "PEAKLOOP",
    title: "PEAKLOOP — The Operating System for Modern Businesses",
    description: "Discover. Compare. Choose. Connect. Automate. Grow.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PEAKLOOP",
    description: "Everything Your Business Needs. Connected.",
  },
};

export const viewport: Viewport = {
  themeColor: "#22C55E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[#f8fafc] text-[#0f172a]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { RouteTransitionManager } from "@/components/ui/route-transition-manager";
import { getSiteUrl } from "@/lib/site-url";
import { Analytics } from "@vercel/analytics/next";

const sans = Manrope({
  variable: "--font-app-sans",
  subsets: ["latin"],
});

const serif = Fraunces({
  variable: "--font-app-serif",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "zoop",
  description: "Minimal weekly Indian meal planner and grocery generator",
  applicationName: "zoop",
  keywords: ["meal planner", "indian meals", "weekly grocery list", "vegan", "nutrition"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "zoop",
    description: "Plan weekly Indian meals and get a pantry-aware grocery list.",
    siteName: "zoop",
  },
  twitter: {
    card: "summary_large_image",
    title: "zoop",
    description: "Plan weekly Indian meals and get a pantry-aware grocery list.",
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
      suppressHydrationWarning
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <RouteTransitionManager />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

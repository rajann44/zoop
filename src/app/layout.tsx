import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const sans = Manrope({
  variable: "--font-app-sans",
  subsets: ["latin"],
});

const serif = Fraunces({
  variable: "--font-app-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Saada Meal Planner",
  description: "Minimal weekly Indian meal planner and grocery generator",
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

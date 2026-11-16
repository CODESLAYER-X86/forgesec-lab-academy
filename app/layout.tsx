import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getSiteUrl } from "@/lib/env";
import { getCurrentUser } from "@/modules/auth/session";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "FORGESEC ACADEMY — Practical Cybersecurity & Linux Learning",
    template: "%s | FORGESEC ACADEMY",
  },
  description:
    "Free, self-paced cybersecurity and Linux engineering platform by FORGESEC LABS. Master command-line fundamentals, networking, and web security.",
  openGraph: {
    type: "website",
    siteName: "FORGESEC ACADEMY",
    title: "FORGESEC ACADEMY — Practical Cybersecurity & Linux Learning",
    description:
      "Free, self-paced cybersecurity and Linux engineering platform by FORGESEC LABS. Structured paths, quizzes, and hands-on assignments.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FORGESEC ACADEMY — Practical Cybersecurity & Linux Learning",
    description:
      "Free, self-paced cybersecurity and Linux engineering platform by FORGESEC LABS.",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable} dark`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-[#101418] text-[#F3F4F6]"
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-[#A3E635] focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:text-[#101418]"
        >
          Skip to main content
        </a>
        <SiteHeader user={user} />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}

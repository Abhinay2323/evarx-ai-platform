import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooterWrapper } from "@/components/site-footer-wrapper";
import { ChatTeaser } from "@/components/chat-teaser";
import { LiveBackground } from "@/components/live-background";
import { OrganizationJsonLd } from "@/components/jsonld";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display"
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "medical AI",
    "pharma AI platform",
    "medical SLM",
    "fine-tune SLM",
    "private healthcare AI",
    "on-prem medical LLM",
    "clinical agents",
    "RAG healthcare"
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description
  },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  themeColor: "#05060F",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} dark bg-ink-950`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-helix-500 focus:px-3 focus:py-2 focus:text-ink-950"
        >
          Skip to content
        </a>
        <LiveBackground />
        <div className="relative z-10">
          <SiteHeader />
          <main id="main" className="relative">
            {children}
          </main>
          <SiteFooterWrapper />
          <ChatTeaser />
        </div>
        <OrganizationJsonLd />
      </body>
    </html>
  );
}

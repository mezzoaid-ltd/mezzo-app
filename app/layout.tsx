// =============================================================================
// ROOT LAYOUT WITH SEO
// Replace your existing app/layout.tsx
// =============================================================================

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/providers/toaster-provider";
import ThemeSwitch from "@/components/theme-switch";
import ThemeContextProvider from "@/components/providers/theme-provider";
import { ConfettiProvider } from "@/components/providers/confetti-provider";
import { JsonLd } from "@/components/json-ld";
import {
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateEducationalOrgSchema,
} from "@/lib/json-ld-schemas";
import { siteConfig } from "@/lib/seo-config";

const inter = Inter({ subsets: ["latin"] });

// =============================================================================
// GLOBAL METADATA
// =============================================================================
export const metadata: Metadata = {
  // Basic metadata
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,

  // Canonical and alternate
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/",
  },

  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    site: siteConfig.social.twitter,
    creator: siteConfig.social.twitter,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  // Manifest
  manifest: "/manifest.json",

  // Verification (add your verification codes when ready)
  // verification: {
  //   google: "your-google-verification-code",
  // },

  // Other
  authors: [{ name: siteConfig.organization.name, url: siteConfig.landingUrl }],
  creator: siteConfig.organization.name,
  publisher: siteConfig.organization.name,
  category: "Education",
};

// =============================================================================
// VIEWPORT
// =============================================================================
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// =============================================================================
// ROOT LAYOUT
// =============================================================================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data - Global */}
        <JsonLd
          data={[
            generateOrganizationSchema(),
            generateWebsiteSchema(),
            generateEducationalOrgSchema(),
          ]}
        />
      </head>
      <body className={inter.className}>
        <ThemeContextProvider>
          <ConfettiProvider />
          <ToastProvider />
          {children}
          <ThemeSwitch />
        </ThemeContextProvider>
      </body>
    </html>
  );
}

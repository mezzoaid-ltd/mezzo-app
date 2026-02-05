// =============================================================================
// SIGN IN PAGE WITH SEO
// Replace: app/(auth)/sign-in/page.tsx
// =============================================================================

import { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SignInForm } from "./_components/sign-in-form";
import { siteConfig } from "@/lib/seo-config";

// =============================================================================
// STATIC METADATA
// =============================================================================
export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Mezzo Aid account. Continue your entrepreneurship journey with gamified learning courses.",
  keywords: ["sign in", "login", "Mezzo Aid", "entrepreneurship", "courses"],
  alternates: {
    canonical: "/sign-in",
  },
  openGraph: {
    type: "website",
    title: "Sign In | Mezzo Aid",
    description:
      "Sign in to your Mezzo Aid account and continue learning entrepreneurship skills.",
    url: `${siteConfig.url}/sign-in`,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Sign In to Mezzo Aid",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.social.twitter,
    title: "Sign In | Mezzo Aid",
    description:
      "Sign in to your Mezzo Aid account and continue learning entrepreneurship skills.",
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// =============================================================================
// PAGE COMPONENT
// =============================================================================
export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}

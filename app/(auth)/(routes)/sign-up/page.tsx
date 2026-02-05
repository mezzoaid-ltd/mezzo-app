// =============================================================================
// SIGN UP PAGE WITH SEO
// Replace: app/(auth)/sign-up/page.tsx
// =============================================================================

import { Metadata } from "next";
import { SignUpForm } from "./_components/sign-up-form";
import { siteConfig } from "@/lib/seo-config";

// =============================================================================
// STATIC METADATA
// =============================================================================
export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your free Mezzo Aid account. Start your entrepreneurship journey with gamified learning courses designed for African entrepreneurs.",
  keywords: [
    "sign up",
    "register",
    "create account",
    "Mezzo Aid",
    "entrepreneurship",
    "free courses",
    "African entrepreneurs",
  ],
  alternates: {
    canonical: "/sign-up",
  },
  openGraph: {
    type: "website",
    title: "Sign Up | Mezzo Aid",
    description:
      "Create your free Mezzo Aid account and start learning entrepreneurship skills today.",
    url: `${siteConfig.url}/sign-up`,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Sign Up for Mezzo Aid",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.social.twitter,
    title: "Sign Up | Mezzo Aid",
    description:
      "Create your free Mezzo Aid account and start learning entrepreneurship skills today.",
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
export default function SignUpPage() {
  return <SignUpForm />;
}

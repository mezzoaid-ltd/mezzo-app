// =============================================================================
// SEO CONFIGURATION
// Central configuration for all SEO-related metadata
// =============================================================================

export const siteConfig = {
  // Core site info
  name: "Mezzo Aid",
  tagline: "Learn Entrepreneurship. Build Your Business.",
  description:
    "Master entrepreneurship through our gamified learning platform. Complete quests, earn certificates, and build your business readiness score with expert-led courses.",

  // URLs
  url: "https://app.mezzoaid.com",
  landingUrl: "https://www.mezzoaid.com",

  // Logo and images
  logo: "https://app.mezzoaid.com/logo.png", // Update with your actual logo path
  ogImage: "https://app.mezzoaid.com/og-image.png", // Default OG image (1200x630)

  // Social links
  social: {
    twitter: "@mezzoaid",
    twitterUrl: "https://twitter.com/mezzoaid",
    linkedin: "https://linkedin.com/company/mezzoaid",
    instagram: "https://instagram.com/mezzoaid",
  },

  // Organization info (for JSON-LD)
  organization: {
    name: "Mezzo Aid",
    legalName: "Mezzo Aid",
    foundingDate: "2024",
    founders: ["Mezzo Aid Team"],
  },

  // Default keywords
  keywords: [
    "entrepreneurship courses",
    "business learning",
    "online business courses",
    "startup education",
    "business skills",
    "entrepreneur training",
    "business development",
    "Mezzo Aid",
  ],
};

// Helper to generate full URL
export const getFullUrl = (path: string) => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${cleanPath}`;
};

// Helper to generate OG image URL for courses
export const getCourseOgImage = (courseImageUrl: string | null) => {
  return courseImageUrl || siteConfig.ogImage;
};

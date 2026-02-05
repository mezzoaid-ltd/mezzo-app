// =============================================================================
// ROBOTS.TXT CONFIGURATION
// Place at: app/robots.ts
// This generates robots.txt at https://app.mezzoaid.com/robots.txt
// =============================================================================

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://app.mezzoaid.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/search",
          "/courses/*",
          "/instructor/*",
          "/verify/*",
          "/sign-in",
          "/sign-up",
        ],
        disallow: [
          "/api/*", // Block API routes
          "/teacher/*", // Block teacher/admin pages
          "/settings", // Block private settings
          "/*?*", // Block query parameters (except allowed ones)
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/*", "/teacher/*", "/settings"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

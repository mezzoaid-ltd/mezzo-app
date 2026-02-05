// =============================================================================
// DYNAMIC SITEMAP GENERATION
// Place at: app/sitemap.ts
// This generates a sitemap.xml at https://app.mezzoaid.com/sitemap.xml
// =============================================================================

import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = "https://app.mezzoaid.com";

// Explicit types for query results
type CourseRow = {
  id: string;
  updated_at: string;
};

type CategoryRow = {
  id: string;
  name: string;
};

type InstructorRow = {
  user_id: string;
};

type CertificateRow = {
  verification_code: string;
  issued_at: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // =============================================================================
  // STATIC PAGES
  // =============================================================================
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/sign-in`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/sign-up`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // =============================================================================
  // DYNAMIC COURSE PAGES
  // =============================================================================
  const { data: coursesRaw } = await supabase
    .from("courses")
    .select("id, updated_at")
    .eq("is_published", true)
    .order("updated_at", { ascending: false });

  const courses = (coursesRaw || []) as unknown as CourseRow[];

  const coursePages: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${BASE_URL}/courses/${course.id}`,
    lastModified: new Date(course.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // =============================================================================
  // CATEGORY PAGES
  // =============================================================================
  const { data: categoriesRaw } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  const categories = (categoriesRaw || []) as unknown as CategoryRow[];

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/search?categoryId=${category.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // =============================================================================
  // INSTRUCTOR PAGES
  // =============================================================================
  // Get unique instructors who have published courses
  const { data: instructorsRaw } = await supabase
    .from("courses")
    .select("user_id")
    .eq("is_published", true);

  const instructors = (instructorsRaw || []) as unknown as InstructorRow[];

  const uniqueInstructorIds = Array.from(
    new Set(instructors.map((i) => i.user_id)),
  );

  const instructorPages: MetadataRoute.Sitemap = uniqueInstructorIds.map(
    (instructorId) => ({
      url: `${BASE_URL}/instructor/${instructorId}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }),
  );

  // =============================================================================
  // CERTIFICATE VERIFICATION PAGES (public)
  // =============================================================================
  const { data: certificatesRaw } = await supabase
    .from("certificates")
    .select("verification_code, issued_at")
    .order("issued_at", { ascending: false })
    .limit(100); // Limit to recent 100 certificates

  const certificates = (certificatesRaw || []) as unknown as CertificateRow[];

  const certificatePages: MetadataRoute.Sitemap = certificates.map((cert) => ({
    url: `${BASE_URL}/verify/${cert.verification_code}`,
    lastModified: new Date(cert.issued_at),
    changeFrequency: "never" as const,
    priority: 0.3,
  }));

  // =============================================================================
  // COMBINE ALL
  // =============================================================================
  return [
    ...staticPages,
    ...coursePages,
    ...categoryPages,
    ...instructorPages,
    ...certificatePages,
  ];
}

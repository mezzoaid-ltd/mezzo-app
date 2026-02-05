// =============================================================================
// COURSE LANDING PAGE WITH SEO
// Replace: app/(course)/courses/[courseId]/page.tsx
// =============================================================================

import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

import { getCourseLanding } from "@/actions/get-course-landing";
import { CourseLanding } from "./_components/course-landing";
import { JsonLd } from "@/components/json-ld";
import {
  generateCourseSchema,
  generateBreadcrumbSchema,
} from "@/lib/json-ld-schemas";
import { siteConfig } from "@/lib/seo-config";

// Explicit types for query results
type MuxDataRow = { playback_id: string | null };

type CourseMetaRow = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  user_id: string;
};

type CategoryMetaRow = {
  name: string;
};

type InstructorMetaRow = {
  name: string;
};

// =============================================================================
// DYNAMIC METADATA FOR SEO
// =============================================================================
interface PageProps {
  params: { courseId: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  // Validate courseId
  if (!params.courseId || params.courseId === "undefined") {
    return {
      title: "Course Not Found",
    };
  }

  const supabase = await createClient();

  // Fetch course data for metadata
  const { data: courseRaw } = await supabase
    .from("courses")
    .select("id, title, description, image_url, price, user_id")
    .eq("id", params.courseId)
    .eq("is_published", true)
    .single();

  const course = courseRaw as unknown as CourseMetaRow | null;

  if (!course) {
    return {
      title: "Course Not Found",
    };
  }

  // Get category
  const { data: categoryRaw } = await supabase
    .from("courses")
    .select("category:categories(name)")
    .eq("id", params.courseId)
    .single();

  const categoryData = categoryRaw as unknown as {
    category: CategoryMetaRow | null;
  } | null;

  // Get instructor name
  const { data: instructorRaw } = await supabase
    .from("profiles")
    .select("name")
    .eq("user_id", course.user_id)
    .single();

  const instructor = instructorRaw as unknown as InstructorMetaRow | null;

  const title = course.title;
  const description =
    course.description?.replace(/<[^>]*>/g, "").slice(0, 160) ||
    `Learn ${course.title} on Mezzo Aid`;
  const imageUrl = course.image_url || siteConfig.ogImage;
  const categoryName = categoryData?.category?.name || "Course";

  return {
    title,
    description,
    keywords: [
      course.title,
      categoryName,
      "online course",
      "learn",
      instructor?.name || "expert instructor",
      "Mezzo Aid",
    ],
    alternates: {
      canonical: `/courses/${params.courseId}`,
    },
    openGraph: {
      type: "website",
      title: `${title} | Mezzo Aid`,
      description,
      url: `${siteConfig.url}/courses/${params.courseId}`,
      siteName: siteConfig.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.social.twitter,
      title: `${title} | Mezzo Aid`,
      description,
      images: [imageUrl],
    },
  };
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================
const CourseIdPage = async ({ params }: PageProps) => {
  // Validate courseId exists and isn't "undefined"
  if (!params.courseId || params.courseId === "undefined") {
    return redirect("/");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get full course landing data
  const landingData = await getCourseLanding(params.courseId, user.id);

  if (!landingData) {
    notFound();
  }

  const { course, chapters, purchase, reviewsData, previewChapter } =
    landingData;

  // If user purchased, redirect to last viewed or first chapter
  if (purchase) {
    // Try to resume from last viewed chapter
    if (purchase.last_viewed_chapter_id) {
      // Verify the chapter still exists and is published
      const lastViewedChapter = chapters.find(
        (ch) => ch.id === purchase.last_viewed_chapter_id,
      );
      if (lastViewedChapter) {
        return redirect(
          `/courses/${params.courseId}/chapters/${purchase.last_viewed_chapter_id}`,
        );
      }
    }

    // Otherwise go to first chapter
    if (chapters.length > 0) {
      return redirect(`/courses/${params.courseId}/chapters/${chapters[0].id}`);
    }
  }

  // User hasn't purchased - show landing page
  // Get preview video playback ID if available
  let previewPlaybackId: string | null = null;
  if (previewChapter) {
    const { data: muxDataRaw } = await supabase
      .from("mux_data")
      .select("playback_id")
      .eq("chapter_id", previewChapter.id)
      .maybeSingle();

    const muxData = muxDataRaw as unknown as MuxDataRow | null;
    previewPlaybackId = muxData?.playback_id || null;
  }

  // Generate structured data for this course
  const courseSchema = generateCourseSchema({
    id: course.id,
    title: course.title,
    description: course.description,
    imageUrl: course.image_url,
    price: course.price,
    instructor: course.instructor
      ? {
          name: course.instructor.name,
          imageUrl: course.instructor.image_url,
        }
      : null,
    category: course.category?.name || null,
    totalChapters: chapters.length,
    averageRating: reviewsData.averageRating,
    totalReviews: reviewsData.totalReviews,
    createdAt: course.created_at,
    updatedAt: course.updated_at,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: siteConfig.url },
    { name: "Courses", url: `${siteConfig.url}/search` },
    {
      name: course.category?.name || "Course",
      url: `${siteConfig.url}/search?categoryId=${course.category_id}`,
    },
    { name: course.title, url: `${siteConfig.url}/courses/${course.id}` },
  ]);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <JsonLd data={[courseSchema, breadcrumbSchema]} />

      {/* Page Content */}
      <CourseLanding
        course={course}
        chapters={chapters}
        previewChapter={previewChapter}
        previewPlaybackId={previewPlaybackId}
        isPurchased={false}
        currentUserId={user.id}
        reviewsData={reviewsData}
      />
    </>
  );
};

export default CourseIdPage;

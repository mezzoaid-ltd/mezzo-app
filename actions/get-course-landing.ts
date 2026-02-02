import { createClient } from "@/lib/supabase/server";
import { getCourseReviews } from "./get-course-reviews";

// Explicit types for query results
type CourseRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  is_published: boolean;
  category_id: string | null;
  created_at: string;
  updated_at: string;
};

type InstructorRow = {
  id: string;
  user_id: string;
  name: string;
  image_url: string | null;
  title: string | null;
  bio: string | null;
};

type ChapterRow = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  is_free: boolean;
  is_published: boolean;
};

type CategoryRow = {
  id: string;
  name: string;
};

type PurchaseRow = {
  id: string;
  last_viewed_chapter_id: string | null;
};

interface CourseLandingData {
  course: CourseRow & {
    instructor: InstructorRow | null;
    category: CategoryRow | null;
  };
  chapters: ChapterRow[];
  purchase: PurchaseRow | null;
  reviewsData: {
    reviews: any[];
    averageRating: number;
    totalReviews: number;
    breakdown: { 5: number; 4: number; 3: number; 2: number; 1: number };
    userReview: any;
  };
  previewChapter: ChapterRow | null;
}

export const getCourseLanding = async (
  courseId: string,
  userId: string,
): Promise<CourseLandingData | null> => {
  try {
    const supabase = await createClient();

    // 1. Get course basic info
    const { data: courseRaw, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .eq("is_published", true)
      .single();

    if (courseError || !courseRaw) {
      console.error("[GET_COURSE_LANDING] course error:", courseError);
      return null;
    }

    const course = courseRaw as unknown as CourseRow;

    // 2. Get instructor info separately
    const { data: instructorRaw } = await supabase
      .from("profiles")
      .select("id, user_id, name, image_url, title, bio")
      .eq("user_id", course.user_id)
      .single();

    const instructor = instructorRaw as unknown as InstructorRow | null;

    // 3. Get category info separately
    let category: CategoryRow | null = null;
    if (course.category_id) {
      const { data: categoryRaw } = await supabase
        .from("categories")
        .select("id, name")
        .eq("id", course.category_id)
        .single();

      category = categoryRaw as unknown as CategoryRow | null;
    }

    // 4. Get all published chapters
    const { data: chaptersRaw, error: chaptersError } = await supabase
      .from("chapters")
      .select("id, title, description, position, is_free, is_published")
      .eq("course_id", courseId)
      .eq("is_published", true)
      .order("position", { ascending: true });

    if (chaptersError) {
      console.error("[GET_COURSE_LANDING] chapters error:", chaptersError);
    }

    const chapters = (chaptersRaw || []) as unknown as ChapterRow[];

    // 5. Get purchase status (including last viewed chapter)
    const { data: purchaseRaw } = await supabase
      .from("purchases")
      .select("id, last_viewed_chapter_id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();

    const purchase = purchaseRaw as unknown as PurchaseRow | null;

    // 6. Get reviews data
    const reviewsData = await getCourseReviews(courseId, userId);

    // 7. Find first free chapter for preview (or first chapter if none are free)
    const previewChapter =
      chapters.find((ch) => ch.is_free) || chapters[0] || null;

    return {
      course: {
        ...course,
        instructor,
        category,
      },
      chapters,
      purchase,
      reviewsData,
      previewChapter,
    };
  } catch (error) {
    console.error("[GET_COURSE_LANDING]", error);
    return null;
  }
};

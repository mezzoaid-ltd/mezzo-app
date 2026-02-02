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

    // 1. Get course with instructor and category
    const { data: courseRaw, error: courseError } = await supabase
      .from("courses")
      .select(
        `
        *,
        instructor:profiles!courses_user_id_fkey(
          id,
          user_id,
          name,
          image_url,
          title,
          bio
        ),
        category:categories(
          id,
          name
        )
      `,
      )
      .eq("id", courseId)
      .eq("is_published", true)
      .single();

    if (courseError || !courseRaw) {
      console.error("[GET_COURSE_LANDING] course error:", courseError);
      return null;
    }

    const course = courseRaw as any;

    // 2. Get all published chapters
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

    // 3. Get purchase status (including last viewed chapter)
    const { data: purchaseRaw } = await supabase
      .from("purchases")
      .select("id, last_viewed_chapter_id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();

    const purchase = purchaseRaw as unknown as PurchaseRow | null;

    // 4. Get reviews data
    const reviewsData = await getCourseReviews(courseId, userId);

    // 5. Find first free chapter for preview (or first chapter if none are free)
    const previewChapter =
      chapters.find((ch) => ch.is_free) || chapters[0] || null;

    return {
      course: {
        id: course.id,
        user_id: course.user_id,
        title: course.title,
        description: course.description,
        image_url: course.image_url,
        price: course.price,
        is_published: course.is_published,
        category_id: course.category_id,
        created_at: course.created_at,
        updated_at: course.updated_at,
        instructor: course.instructor || null,
        category: course.category || null,
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

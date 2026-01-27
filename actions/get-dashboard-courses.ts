import { createClient } from "@/lib/supabase/server";
import { getProgress } from "./get-progress";
import { Database } from "@/lib/supabase/types";

type Course = Database["public"]["Tables"]["courses"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Chapter = Database["public"]["Tables"]["chapters"]["Row"];

type CourseWithProgressWithCategory = Course & {
  category: Category;
  chapters: Chapter[];
  progress: number | null;
};

type DashboardCourses = {
  completedCourses: CourseWithProgressWithCategory[];
  coursesInProgress: CourseWithProgressWithCategory[];
};

export const getDashboardCourses = async (
  userId: string,
): Promise<DashboardCourses> => {
  try {
    const supabase = await createClient();

    // Get all purchased courses
    const { data: purchasesData, error } = await supabase
      .from("purchases")
      .select(
        `
        *,
        course:courses(
          *,
          category:categories(*),
          chapters(id, title, position, is_published)
        )
      `,
      )
      .eq("user_id", userId);

    if (error) {
      console.error("[GET_DASHBOARD_COURSES]", error);
      return {
        completedCourses: [],
        coursesInProgress: [],
      };
    }

    if (!purchasesData || purchasesData.length === 0) {
      return {
        completedCourses: [],
        coursesInProgress: [],
      };
    }

    // Type assertion for joined data
    type PurchaseWithCourse = {
      course: Course & {
        category: Category;
        chapters: Array<
          Pick<Chapter, "id" | "title" | "position" | "is_published">
        >;
      };
    };

    const purchases = purchasesData as unknown as PurchaseWithCourse[];

    // Extract courses and filter published chapters
    const courses: CourseWithProgressWithCategory[] = [];

    for (const purchase of purchases) {
      if (purchase.course) {
        const courseData = purchase.course;

        // Filter only published chapters
        const publishedChapters =
          courseData.chapters?.filter((ch) => ch.is_published) || [];

        // Get progress for this course
        const progress = await getProgress(userId, courseData.id);

        courses.push({
          id: courseData.id,
          user_id: courseData.user_id,
          title: courseData.title,
          description: courseData.description,
          image_url: courseData.image_url,
          price: courseData.price,
          is_published: courseData.is_published,
          category_id: courseData.category_id,
          created_at: courseData.created_at,
          updated_at: courseData.updated_at,
          category: courseData.category,
          chapters: publishedChapters as Chapter[],
          progress,
        });
      }
    }

    // Handle completed and courses in progress
    const completedCourses = courses.filter(
      (course) => course.progress === 100,
    );

    const coursesInProgress = courses.filter(
      (course) => (course.progress ?? 0) < 100,
    );

    return {
      completedCourses,
      coursesInProgress,
    };
  } catch (error) {
    console.log("[GET_DASHBOARD_COURSES]", error);
    return {
      completedCourses: [],
      coursesInProgress: [],
    };
  }
};

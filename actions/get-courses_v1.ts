import { createClient } from "@/lib/supabase/server";
import { getProgress } from "./get-progress";
import { CourseWithProgressWithCategory } from "@/types";
import { Database } from "@/lib/supabase/types";

type Course = Database["public"]["Tables"]["courses"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

type InstructorInfo = {
  id: string;
  name: string;
  image_url: string | null;
  title: string | null;
};

type GetCourses = {
  userId: string;
  title?: string;
  categoryId?: string;
};

export const getCourses = async ({
  userId,
  title,
  categoryId,
}: GetCourses): Promise<CourseWithProgressWithCategory[]> => {
  try {
    const supabase = await createClient();

    // Build query - fetch courses and categories first
    let query = supabase
      .from("courses")
      .select(
        `
        *,
        category:categories(*)
      `,
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    // Add filters
    if (title) {
      query = query.ilike("title", `%${title}%`);
    }

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data: coursesData, error } = await query;

    if (error) {
      console.error("[GET_COURSES]", error);
      return [];
    }

    if (!coursesData) return [];

    const courses = coursesData as unknown as Array<
      Course & { category: Category | null }
    >;

    // Get all unique instructor user_ids from courses
    const instructorUserIds = Array.from(
      new Set(courses.map((c) => c.user_id)),
    );

    // Fetch all instructors by user_id (since courses.user_id = profiles.user_id)
    const { data: instructorsData } = await supabase
      .from("profiles")
      .select("user_id, name, image_url, title")
      .in("user_id", instructorUserIds);

    // Create instructor map for quick lookup using user_id as key
    const instructorsMap = new Map<string, InstructorInfo>();

    if (instructorsData) {
      instructorsData.forEach((instructor: any) => {
        instructorsMap.set(instructor.user_id, {
          id: instructor.user_id, // Use user_id for the instructor link
          name: instructor.name,
          image_url: instructor.image_url,
          title: instructor.title,
        });
      });
    }

    // Get chapters and progress for each course
    const coursesWithProgress: CourseWithProgressWithCategory[] =
      await Promise.all(
        courses.map(async (course) => {
          // Get published chapters
          const { data: publishedChapters } = await supabase
            .from("chapters")
            .select("id")
            .eq("course_id", course.id)
            .eq("is_published", true);

          // Check if user purchased this course
          const { data: purchase } = await supabase
            .from("purchases")
            .select("id")
            .eq("user_id", userId)
            .eq("course_id", course.id)
            .maybeSingle();

          const hasPurchased = !!purchase;

          // Only calculate progress if user purchased
          const progressPercentage = hasPurchased
            ? await getProgress(userId, course.id)
            : null;

          // Get instructor from map using course.user_id
          const instructor = instructorsMap.get(course.user_id) || null;

          return {
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
            category: course.category,
            chapters: publishedChapters || [],
            progress: progressPercentage,
            instructor: instructor,
          };
        }),
      );

    return coursesWithProgress;
  } catch (error) {
    console.log("[GET_COURSES]", error);
    return [];
  }
};

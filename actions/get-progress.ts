import { createClient } from "@/lib/supabase/server";

export const getProgress = async (
  userId: string,
  courseId: string,
): Promise<number> => {
  try {
    const supabase = await createClient();

    // Get published chapters for this course
    const { data: publishedChaptersData, error: chaptersError } = await supabase
      .from("chapters")
      .select("id")
      .eq("course_id", courseId)
      .eq("is_published", true);

    if (
      chaptersError ||
      !publishedChaptersData ||
      publishedChaptersData.length === 0
    ) {
      return 0;
    }

    // Explicit type for chapters
    const publishedChapters = publishedChaptersData as Array<{ id: string }>;
    const publishedChapterIds = publishedChapters.map((chapter) => chapter.id);

    // Get completed chapters for this user
    const { data: completedChaptersData, error: progressError } = await supabase
      .from("user_progress")
      .select("id")
      .eq("user_id", userId)
      .in("chapter_id", publishedChapterIds)
      .eq("is_completed", true);

    if (progressError) {
      console.error("[GET_PROGRESS]", progressError);
      return 0;
    }

    const completedChapters = completedChaptersData as Array<{
      id: string;
    }> | null;
    const validCompletedChapters = completedChapters?.length || 0;

    const progressPercentage =
      (validCompletedChapters / publishedChapters.length) * 100;

    return progressPercentage;
  } catch (error) {
    console.log("[GET_PROGRESS]", error);
    return 0;
  }
};

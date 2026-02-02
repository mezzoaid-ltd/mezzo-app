import { createClient } from "@/lib/supabase/server";

export const trackLastViewed = async (
  userId: string,
  courseId: string,
  chapterId: string,
): Promise<void> => {
  try {
    const supabase = await createClient();

    // Update the purchase record with last viewed chapter
    await supabase
      .from("purchases")
      //   @ts-expect-error: Table definition may be missing last_viewed_chapter_id
      .update({ last_viewed_chapter_id: chapterId })
      .eq("user_id", userId)
      .eq("course_id", courseId);
  } catch (error) {
    console.error("[TRACK_LAST_VIEWED]", error);
    // Don't throw - this is a nice-to-have feature, shouldn't break page load
  }
};

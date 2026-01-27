import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/types";

// Define types
type Chapter = Database["public"]["Tables"]["chapters"]["Row"];
type Course = Pick<Database["public"]["Tables"]["courses"]["Row"], "price">;
type MuxData = Database["public"]["Tables"]["mux_data"]["Row"];
type Attachment = Database["public"]["Tables"]["attachments"]["Row"];
type UserProgress = Database["public"]["Tables"]["user_progress"]["Row"];
type Purchase = Database["public"]["Tables"]["purchases"]["Row"];

interface GetChapterReturn {
  chapter: Chapter | null;
  course: Course | null;
  muxData: MuxData | null;
  attachments: Attachment[];
  nextChapter: Chapter | null;
  userProgress: UserProgress | null;
  purchase: Purchase | null;
}

interface getChapterProps {
  userId: string;
  courseId: string;
  chapterId: string;
}

export const getChapter = async ({
  userId,
  courseId,
  chapterId,
}: getChapterProps): Promise<GetChapterReturn> => {
  try {
    const supabase = await createClient();

    // Check if user purchased the course
    const { data: purchase } = await supabase
      .from("purchases")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();

    // Get course details
    const { data: courseData } = await supabase
      .from("courses")
      .select("price")
      .eq("id", courseId)
      .eq("is_published", true)
      .maybeSingle();

    // Get chapter details
    const { data: chapterData } = await supabase
      .from("chapters")
      .select("*")
      .eq("id", chapterId)
      .eq("is_published", true)
      .maybeSingle();

    // Type assertions and null checks
    const course = courseData as Course | null;
    const chapter = chapterData as Chapter | null;

    // Early return if chapter or course not found
    if (!chapter || !course) {
      return {
        chapter: null,
        course: null,
        muxData: null,
        attachments: [],
        nextChapter: null,
        userProgress: null,
        purchase: null,
      };
    }

    // Now TypeScript knows chapter is Chapter (not null)
    let muxData: MuxData | null = null;
    let attachments: Attachment[] = [];
    let nextChapter: Chapter | null = null;

    // If user purchased, get attachments
    if (purchase) {
      const { data: attachmentsData } = await supabase
        .from("attachments")
        .select("*")
        .eq("course_id", courseId);

      attachments = (attachmentsData as Attachment[]) || [];
    }

    // If chapter is free or user purchased, get mux data and next chapter
    if (chapter.is_free || purchase) {
      // Get mux data
      const { data: muxDataResult } = await supabase
        .from("mux_data")
        .select("*")
        .eq("chapter_id", chapterId)
        .maybeSingle();

      muxData = muxDataResult as MuxData | null;

      // Get next chapter
      const { data: nextChapterData } = await supabase
        .from("chapters")
        .select("*")
        .eq("course_id", courseId)
        .eq("is_published", true)
        .gt("position", chapter.position)
        .order("position", { ascending: true })
        .limit(1)
        .maybeSingle();

      nextChapter = nextChapterData as Chapter | null;
    }

    // Get user progress
    const { data: userProgressData } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("chapter_id", chapterId)
      .maybeSingle();

    const userProgress = userProgressData as UserProgress | null;

    return {
      chapter,
      course,
      muxData,
      attachments,
      nextChapter,
      userProgress,
      purchase: purchase as Purchase | null,
    };
  } catch (error) {
    console.log("[GET_CHAPTER]", error);
    return {
      chapter: null,
      course: null,
      muxData: null,
      attachments: [],
      nextChapter: null,
      userProgress: null,
      purchase: null,
    };
  }
};

import { createClient } from "@/lib/supabase/server";

interface RecentActivity {
  id: string;
  chapterTitle: string;
  courseTitle: string;
  completedAt: string;
}

interface StudentDashboardStats {
  totalChaptersCompleted: number;
  totalChaptersAvailable: number;
  averageProgress: number; // 0–100
  recentActivity: RecentActivity[];
}

// Explicit types for each query result so we don't rely on Supabase inference
type PurchaseRow = { course_id: string };
type ChapterRow = {
  id: string;
  title: string;
  course_id: string;
  is_published: boolean;
};
type ProgressRow = {
  chapter_id: string;
  is_completed: boolean;
  updated_at: string;
};
type CourseRow = { id: string; title: string };

export const getStudentDashboardStats = async (
  userId: string,
): Promise<StudentDashboardStats> => {
  try {
    const supabase = await createClient();

    // 1. Get all purchased course IDs for this user
    const { data: purchasesRaw, error: purchaseError } = await supabase
      .from("purchases")
      .select("course_id")
      .eq("user_id", userId);

    const purchases = (purchasesRaw || []) as unknown as PurchaseRow[];

    if (purchaseError || purchases.length === 0) {
      return {
        totalChaptersCompleted: 0,
        totalChaptersAvailable: 0,
        averageProgress: 0,
        recentActivity: [],
      };
    }

    const courseIds = purchases.map((p) => p.course_id);

    // 2. Get total published chapters across all purchased courses
    const { data: chaptersRaw, error: chaptersError } = await supabase
      .from("chapters")
      .select("id, title, course_id, is_published")
      .in("course_id", courseIds)
      .eq("is_published", true);

    if (chaptersError) {
      console.error(
        "[GET_STUDENT_DASHBOARD_STATS] chapters error:",
        chaptersError,
      );
    }

    const publishedChapters = (chaptersRaw || []) as unknown as ChapterRow[];
    const totalChaptersAvailable = publishedChapters.length;
    const publishedChapterIds = publishedChapters.map((ch) => ch.id);

    // 3. Get all completed progress entries for those chapters
    const { data: progressRaw, error: progressError } = await supabase
      .from("user_progress")
      .select("chapter_id, is_completed, updated_at")
      .eq("user_id", userId)
      .in("chapter_id", publishedChapterIds)
      .eq("is_completed", true);

    if (progressError) {
      console.error(
        "[GET_STUDENT_DASHBOARD_STATS] progress error:",
        progressError,
      );
    }

    const completedEntries = (progressRaw || []) as unknown as ProgressRow[];
    const totalChaptersCompleted = completedEntries.length;

    // 4. Calculate average progress per course
    const chaptersByCourse: Record<string, string[]> = {};
    for (const ch of publishedChapters) {
      if (!chaptersByCourse[ch.course_id]) {
        chaptersByCourse[ch.course_id] = [];
      }
      chaptersByCourse[ch.course_id].push(ch.id);
    }

    const completedChapterIds = new Set(
      completedEntries.map((e) => e.chapter_id),
    );

    let totalProgress = 0;
    const courseCount = Object.keys(chaptersByCourse).length;

    for (const courseId of Object.keys(chaptersByCourse)) {
      const chapterIds = chaptersByCourse[courseId];
      const completedInCourse = chapterIds.filter((id) =>
        completedChapterIds.has(id),
      ).length;
      const courseProgress =
        chapterIds.length > 0
          ? (completedInCourse / chapterIds.length) * 100
          : 0;
      totalProgress += courseProgress;
    }

    const averageProgress =
      courseCount > 0 ? Math.round(totalProgress / courseCount) : 0;

    // 5. Build recent activity — last 5 completed chapters sorted by updated_at desc
    const { data: coursesRaw } = await supabase
      .from("courses")
      .select("id, title")
      .in("id", courseIds);

    const coursesData = (coursesRaw || []) as unknown as CourseRow[];

    const courseTitleMap: Record<string, string> = {};
    for (const c of coursesData) {
      courseTitleMap[c.id] = c.title;
    }

    const chapterTitleMap: Record<
      string,
      { title: string; course_id: string }
    > = {};
    for (const ch of publishedChapters) {
      chapterTitleMap[ch.id] = { title: ch.title, course_id: ch.course_id };
    }

    const sorted = [...completedEntries].sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );

    const recentActivity: RecentActivity[] = sorted.slice(0, 5).map((entry) => {
      const chapterInfo = chapterTitleMap[entry.chapter_id];
      return {
        id: entry.chapter_id,
        chapterTitle: chapterInfo?.title || "Unknown Chapter",
        courseTitle: chapterInfo
          ? courseTitleMap[chapterInfo.course_id] || "Unknown Course"
          : "Unknown Course",
        completedAt: entry.updated_at,
      };
    });

    return {
      totalChaptersCompleted,
      totalChaptersAvailable,
      averageProgress,
      recentActivity,
    };
  } catch (error) {
    console.error("[GET_STUDENT_DASHBOARD_STATS]", error);
    return {
      totalChaptersCompleted: 0,
      totalChaptersAvailable: 0,
      averageProgress: 0,
      recentActivity: [],
    };
  }
};

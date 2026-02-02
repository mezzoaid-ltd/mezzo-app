import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

import { getCourseLanding } from "@/actions/get-course-landing";
import { CourseLanding } from "./_components/course-landing";

// Explicit type for mux_data query
type MuxDataRow = { playback_id: string | null };

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
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
    return redirect("/");
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

  return (
    <CourseLanding
      course={course}
      chapters={chapters}
      previewChapter={previewChapter}
      previewPlaybackId={previewPlaybackId}
      isPurchased={false}
      currentUserId={user.id}
      reviewsData={reviewsData}
    />
  );
};

export default CourseIdPage;

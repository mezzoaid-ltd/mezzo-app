import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getProgress } from "@/actions/get-progress";

export async function PUT(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } },
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { isCompleted } = await req.json();

    // Upsert user progress with type assertion
    const { data: userProgress, error } = await (
      supabase.from("user_progress") as any
    )
      .upsert(
        {
          user_id: user.id,
          chapter_id: params.chapterId,
          is_completed: isCompleted,
        },
        {
          onConflict: "user_id,chapter_id",
        },
      )
      .select()
      .single();

    if (error) {
      console.error("[CHAPTER_ID_PROGRESS]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }

    // ✅ SEND CHAPTER COMPLETION EMAIL - Only when marking as complete
    if (isCompleted) {
      try {
        // Get profile
        const { data: profileRaw } = await supabase
          .from("profiles")
          .select("name, email")
          .eq("user_id", user.id)
          .single();

        if (!profileRaw) {
          console.error("[CHAPTER_COMPLETION_EMAIL] Profile not found");
          return NextResponse.json(userProgress);
        }

        const profile = profileRaw as { name: string; email: string };

        // Get chapter with course info
        const { data: chapterRaw } = await supabase
          .from("chapters")
          .select("id, title, position, course_id")
          .eq("id", params.chapterId)
          .single();

        if (!chapterRaw) {
          console.error("[CHAPTER_COMPLETION_EMAIL] Chapter not found");
          return NextResponse.json(userProgress);
        }

        const chapter = chapterRaw as {
          id: string;
          title: string;
          position: number;
          course_id: string;
        };

        // Get course info
        const { data: courseRaw } = await supabase
          .from("courses")
          .select("title")
          .eq("id", params.courseId)
          .single();

        if (!courseRaw) {
          console.error("[CHAPTER_COMPLETION_EMAIL] Course not found");
          return NextResponse.json(userProgress);
        }

        const course = courseRaw as { title: string };

        // Get total chapters count
        const { data: allChaptersRaw } = await supabase
          .from("chapters")
          .select("id")
          .eq("course_id", params.courseId)
          .eq("is_published", true);

        const totalChapters = (allChaptersRaw || []).length;

        // Get completed chapters count
        const chapterIds = (allChaptersRaw || []).map((ch: any) => ch.id);
        const { data: completedProgressRaw } = await supabase
          .from("user_progress")
          .select("chapter_id")
          .eq("user_id", user.id)
          .eq("is_completed", true)
          .in("chapter_id", chapterIds);

        const completedChapters = (completedProgressRaw || []).length;

        // Calculate progress percentage
        const progressPercentage = await getProgress(user.id, params.courseId);

        // Get next chapter
        const { data: nextChapterRaw } = await supabase
          .from("chapters")
          .select("id, title")
          .eq("course_id", params.courseId)
          .eq("is_published", true)
          .gt("position", chapter.position)
          .order("position", { ascending: true })
          .limit(1)
          .maybeSingle();

        const nextChapter = nextChapterRaw as {
          id: string;
          title: string;
        } | null;

        // Send email (fire and forget - don't block response)
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          "https://mezzo-app-service.onrender.com";
        fetch(`${API_BASE_URL}/api/v1/emails/lms/chapter-completion`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: profile.email,
            userName: profile.name,
            chapterTitle: chapter.title,
            courseName: course.title,
            courseUrl: `https://app.mezzoaid.com/courses/${params.courseId}`,
            nextChapterTitle: nextChapter?.title,
            nextChapterUrl: nextChapter
              ? `https://app.mezzoaid.com/courses/${params.courseId}/chapters/${nextChapter.id}`
              : undefined,
            completedChapters,
            totalChapters,
            progressPercentage: Math.round(progressPercentage),
          }),
        }).catch((err) =>
          console.error("[CHAPTER_COMPLETION_EMAIL] Failed:", err),
        );
      } catch (emailError) {
        console.error("[CHAPTER_COMPLETION_EMAIL] Error:", emailError);
        // Don't block the response if email fails
      }
    }

    return NextResponse.json(userProgress);
  } catch (error) {
    console.log("[CHAPTER_ID_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

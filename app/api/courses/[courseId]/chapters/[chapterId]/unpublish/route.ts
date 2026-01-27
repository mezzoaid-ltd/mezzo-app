import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
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

    // Check if user owns the course
    const { data: ownCourse } = await supabase
      .from("courses")
      .select("id")
      .eq("id", params.courseId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: unpublishedChapter, error } = await (
      supabase.from("chapters") as any
    )
      .update({ is_published: false })
      .eq("id", params.chapterId)
      .eq("course_id", params.courseId)
      .select()
      .single();

    if (error) {
      console.error("[CHAPTER_UNPUBLISH]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }

    // Check if course has any published chapters left
    const { data: publishedChapters } = await supabase
      .from("chapters")
      .select("id")
      .eq("course_id", params.courseId)
      .eq("is_published", true);

    if (!publishedChapters || publishedChapters.length === 0) {
      await (supabase.from("courses") as any)
        .update({ is_published: false })
        .eq("id", params.courseId);
    }

    return NextResponse.json(unpublishedChapter);
  } catch (error) {
    console.log("[CHAPTER_UNPUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

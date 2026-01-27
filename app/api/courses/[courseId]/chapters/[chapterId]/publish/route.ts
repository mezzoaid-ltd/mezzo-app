import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Database } from "@/lib/supabase/types";

type Chapter = Database["public"]["Tables"]["chapters"]["Row"];
type MuxData = Database["public"]["Tables"]["mux_data"]["Row"];

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

    // Get chapter
    const { data: chapterData } = await supabase
      .from("chapters")
      .select("*")
      .eq("id", params.chapterId)
      .eq("course_id", params.courseId)
      .maybeSingle();

    // Get mux data
    const { data: muxDataResult } = await supabase
      .from("mux_data")
      .select("*")
      .eq("chapter_id", params.chapterId)
      .maybeSingle();

    // Type assertions
    const chapter = chapterData as Chapter | null;
    const muxData = muxDataResult as MuxData | null;

    if (
      !chapter ||
      !muxData ||
      !chapter.title ||
      !chapter.description ||
      !chapter.video_url
    ) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const { data: publishedChapter, error } = await (
      supabase.from("chapters") as any
    )
      .update({ is_published: true })
      .eq("id", params.chapterId)
      .eq("course_id", params.courseId)
      .select()
      .single();

    if (error) {
      console.error("[CHAPTER_PUBLISH]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(publishedChapter);
  } catch (error) {
    console.log("[CHAPTER_PUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

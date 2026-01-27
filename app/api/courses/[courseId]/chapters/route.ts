import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Database } from "@/lib/supabase/types";

type Chapter = Database["public"]["Tables"]["chapters"]["Row"];

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } },
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title } = await req.json();

    // Check if user owns the course
    const { data: courseOwner } = await supabase
      .from("courses")
      .select("id")
      .eq("id", params.courseId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get last chapter position
    const { data: lastChapterData } = await supabase
      .from("chapters")
      .select("position")
      .eq("course_id", params.courseId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Type assertion
    const lastChapter = lastChapterData as Pick<Chapter, "position"> | null;

    const newPosition = lastChapter ? lastChapter.position + 1 : 1;

    const { data: chapter, error } = await (supabase.from("chapters") as any)
      .insert({
        title,
        course_id: params.courseId,
        position: newPosition,
      })
      .select()
      .single();

    if (error) {
      console.error("[CHAPTERS]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[CHAPTERS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

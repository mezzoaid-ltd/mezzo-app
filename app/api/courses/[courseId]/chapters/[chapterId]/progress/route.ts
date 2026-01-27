import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

    return NextResponse.json(userProgress);
  } catch (error) {
    console.log("[CHAPTER_ID_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

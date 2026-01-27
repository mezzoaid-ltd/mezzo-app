import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
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

    // Get course
    const { data: course } = await supabase
      .from("courses")
      .select("*")
      .eq("id", params.courseId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    const { data: unpublishedCourse, error } = await (
      supabase.from("courses") as any
    )
      .update({ is_published: false })
      .eq("id", params.courseId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[COURSE_ID_UNPUBLISH]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(unpublishedCourse);
  } catch (error) {
    console.log("[COURSE_ID_UNPUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

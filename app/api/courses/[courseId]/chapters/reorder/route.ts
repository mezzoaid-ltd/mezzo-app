import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
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

    const { list } = await req.json();

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

    // Update positions for each chapter
    for (let item of list) {
      await (supabase.from("chapters") as any)
        .update({ position: item.position })
        .eq("id", item.id);
    }

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.log("[REORDER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

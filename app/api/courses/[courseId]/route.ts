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

    const { courseId } = params;
    const values = await req.json();

    const { data: course, error } = await (supabase.from("courses") as any)
      .update(values)
      .eq("id", courseId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[COURSE_ID]", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSE_ID]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
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

    const { data: course, error } = await supabase
      .from("courses")
      .delete()
      .eq("id", params.courseId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[COURSE_ID_DELETE]", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSE_ID_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

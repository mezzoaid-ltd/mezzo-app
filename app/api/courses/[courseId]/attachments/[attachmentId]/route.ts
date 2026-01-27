import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; attachmentId: string } },
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
    const { data: courseOwner } = await supabase
      .from("courses")
      .select("id")
      .eq("id", params.courseId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: attachment, error } = await supabase
      .from("attachments")
      .delete()
      .eq("course_id", params.courseId)
      .eq("id", params.attachmentId)
      .select()
      .single();

    if (error) {
      console.error("ATTACHMENT_ID", error);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(attachment);
  } catch (error) {
    console.log("ATTACHMENT_ID", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

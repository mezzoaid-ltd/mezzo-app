import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

    const { url, originalFilename } = await req.json();

    console.log("COURSE_ID_ATTACHMENTS", url, params.courseId);

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

    var name = url ? url.split("/").pop() : "Untitled";
    if (originalFilename) {
      name = originalFilename;
    }

    const { data: attachment, error } = await (
      supabase.from("attachments") as any
    )
      .insert({
        url,
        name,
        course_id: params.courseId,
      })
      .select()
      .single();

    if (error) {
      console.error("COURSE_ID_ATTACHMENTS", error);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(attachment);
  } catch (error) {
    console.log("COURSE_ID_ATTACHMENTS", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

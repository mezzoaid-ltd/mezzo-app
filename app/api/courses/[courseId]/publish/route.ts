import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Database } from "@/lib/supabase/types";

type Course = Database["public"]["Tables"]["courses"]["Row"];
type Chapter = Database["public"]["Tables"]["chapters"]["Row"];

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

    // Get course with chapters
    const { data: courseData } = await supabase
      .from("courses")
      .select(
        `
        *,
        chapters(*)
      `,
      )
      .eq("id", params.courseId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!courseData) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Type assertion for joined data
    const course = courseData as unknown as Course & {
      chapters: Chapter[];
    };

    const hasPublishedChapter = course.chapters?.some(
      (chapter) => chapter.is_published,
    );

    if (
      !course.title ||
      !course.description ||
      !course.image_url ||
      !course.category_id ||
      !hasPublishedChapter
    ) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const { data: publishedCourse, error } = await (
      supabase.from("courses") as any
    )
      .update({ is_published: true })
      .eq("id", params.courseId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[COURSE_ID_PUBLISH]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }

    // ✅ SEND COURSE PUBLISHED EMAIL - Fire and forget
    try {
      // Get instructor profile
      const { data: profileRaw } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("user_id", user.id)
        .single();

      if (!profileRaw) {
        console.error("[COURSE_PUBLISHED_EMAIL] Profile not found");
        return NextResponse.json(publishedCourse);
      }

      const profile = profileRaw as { name: string; email: string };

      // Count published chapters
      const publishedChaptersCount =
        course.chapters?.filter((ch) => ch.is_published).length || 0;

      // Send published notification
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://mezzo-app-service.onrender.com";
      fetch(`${API_BASE_URL}/api/v1/emails/lms/course-published`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: profile.email,
          instructorName: profile.name,
          courseName: course.title,
          courseUrl: `https://app.mezzoaid.com/courses/${params.courseId}`,
          courseImageUrl: course.image_url || "",
          totalChapters: publishedChaptersCount,
          publishDate: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        }),
      }).catch((err) => console.error("[COURSE_PUBLISHED_EMAIL] Failed:", err));
    } catch (emailError) {
      console.error("[COURSE_PUBLISHED_EMAIL] Error:", emailError);
      // Don't block course publishing if email fails
    }

    return NextResponse.json(publishedCourse);
  } catch (error) {
    console.log("[COURSE_ID_PUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

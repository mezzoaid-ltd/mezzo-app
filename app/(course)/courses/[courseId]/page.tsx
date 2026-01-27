import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Database } from "@/lib/supabase/types";

type Course = Database["public"]["Tables"]["courses"]["Row"];
type Chapter = Database["public"]["Tables"]["chapters"]["Row"];

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const supabase = await createClient();

  const { data: courseData, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      chapters(*)
    `,
    )
    .eq("id", params.courseId)
    .single();

  if (error || !courseData) {
    return redirect("/");
  }

  // Type assertion for joined data
  const course = courseData as unknown as Course & {
    chapters: Chapter[];
  };

  // Filter published chapters and sort by position
  const publishedChapters = (course.chapters || [])
    .filter((ch) => ch.is_published)
    .sort((a, b) => a.position - b.position);

  if (publishedChapters.length === 0) {
    return redirect("/");
  }

  return redirect(`/courses/${course.id}/chapters/${publishedChapters[0].id}`);
};

export default CourseIdPage;

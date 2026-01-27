import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/current-profile";
import { getProgress } from "@/actions/get-progress";
import { CourseSidebar } from "./_components/course-sidebar";
import { CourseNavbar } from "./_components/course-navbar";
import { Database } from "@/lib/supabase/types";

// Define the types we need
type Course = Database["public"]["Tables"]["courses"]["Row"];
type Chapter = Database["public"]["Tables"]["chapters"]["Row"];
type UserProgress = Database["public"]["Tables"]["user_progress"]["Row"];

// Type for the joined query result
type CourseWithJoinedData = Course & {
  chapters: Array<
    Chapter & {
      user_progress: UserProgress[];
    }
  >;
};

const CourseLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) => {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user profile
  const profile = await getCurrentProfile();
  if (!profile) {
    return redirect("/sign-in");
  }

  // Get course with chapters
  const { data: courseData, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      chapters(
        *,
        user_progress(*)
      )
    `,
    )
    .eq("id", params.courseId)
    .single();

  if (error || !courseData) {
    return redirect("/");
  }

  // Type assertion for the joined data
  const course = courseData as unknown as CourseWithJoinedData;

  // Filter published chapters and their progress
  const publishedChapters = (course.chapters || [])
    .filter((ch) => ch.is_published)
    .map((ch) => ({
      ...ch,
      userProgress:
        ch.user_progress?.filter((up) => up.user_id === user.id) || [],
    }))
    .sort((a, b) => a.position - b.position);

  const courseWithChapters = {
    ...course,
    chapters: publishedChapters,
  };

  // Get progress count
  const progressCount = await getProgress(user.id, course.id);

  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
        <CourseNavbar
          course={courseWithChapters}
          progressCount={progressCount}
          currentProfile={profile}
        />
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseSidebar
          course={courseWithChapters}
          progressCount={progressCount}
        />
      </div>
      <main className="md:pl-80 pt-[80px] h-full">{children}</main>
    </div>
  );
};

export default CourseLayout;

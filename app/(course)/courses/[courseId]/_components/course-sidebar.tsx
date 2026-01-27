// import { createClient } from "@/lib/supabase/server";
// import { redirect } from "next/navigation";
// import { CourseProgress } from "@/components/course-progress";
// import { CourseSidebarItem } from "./course-sidebar-item";

// interface CourseSidebarProps {
//   course: {
//     id: string;
//     title: string;
//     chapters: {
//       id: string;
//       title: string;
//       position: number;
//       is_free: boolean;
//       userProgress?: { is_completed: boolean }[];
//     }[];
//   };
//   progressCount: number;
// }

// export const CourseSidebar = async ({
//   course,
//   progressCount,
// }: CourseSidebarProps) => {
//   const supabase = await createClient();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     return redirect("/sign-in");
//   }

//   // Check if user purchased the course
//   const { data: purchase } = await supabase
//     .from("purchases")
//     .select("*")
//     .eq("user_id", user.id)
//     .eq("course_id", course.id)
//     .maybeSingle();

//   return (
//     <div className="flex flex-col h-full overflow-y-auto border-r shadow-sm">
//       <div className="flex flex-col p-8 border-b">
//         <h1 className="font-semibold">{course.title}</h1>
//         {purchase && (
//           <div className="mt-10">
//             <CourseProgress variant="success" value={progressCount} />
//           </div>
//         )}
//       </div>
//       <div className="flex flex-col w-full">
//         {course.chapters.map((chapter) => (
//           <CourseSidebarItem
//             key={chapter.id}
//             id={chapter.id}
//             label={chapter.title}
//             isCompleted={!!chapter.userProgress?.[0]?.is_completed}
//             courseId={course.id}
//             isLocked={!chapter.is_free && !purchase}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CourseProgress } from "@/components/course-progress";
import { CourseSidebarItem } from "./course-sidebar-item";
import { Chapter, Course, UserProgress } from "@/lib/supabase/database-types";

interface CourseSidebarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress?: UserProgress[] | null;
    })[];
  };
  progressCount: number;
}

export const CourseSidebar = async ({
  course,
  progressCount,
}: CourseSidebarProps) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Check if user purchased the course
  const { data: purchase } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .maybeSingle();

  return (
    <div className="flex flex-col h-full overflow-y-auto border-r shadow-sm">
      <div className="flex flex-col p-8 border-b">
        <h1 className="font-semibold">{course.title}</h1>
        {purchase && (
          <div className="mt-10">
            <CourseProgress variant="success" value={progressCount} />
          </div>
        )}
      </div>
      <div className="flex flex-col w-full">
        {course.chapters.map((chapter) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            isCompleted={!!chapter.userProgress?.[0]?.is_completed}
            courseId={course.id}
            isLocked={!chapter.is_free && !purchase}
          />
        ))}
      </div>
    </div>
  );
};

// import { Chapter, Course, UserProgress } from "@/lib/supabase/database-types";

// import { NavbarRoutes } from "@/components/navbar-routes";

// import { CourseMobileSidebar } from "./course-mobile-sidebar";
// import { SafeProfile } from "@/types";

// interface CourseNavbarProps {
//   course: Course & {
//     chapters: (Chapter & {
//       userProgress: UserProgress[] | null;
//     })[];
//   };
//   progressCount: number;
//   currentProfile?: SafeProfile | null;
// }

// export const CourseNavbar = ({
//   course,
//   progressCount,
//   currentProfile,
// }: CourseNavbarProps) => {
//   return (
//     <div className="p-4 border-b h-full flex items-center  shadow-sm">
//       <CourseMobileSidebar course={course} progressCount={progressCount} />
//       <NavbarRoutes currentProfile={currentProfile} />
//     </div>
//   );
// };

import { Chapter, Course, UserProgress } from "@/lib/supabase/database-types";
import { CertificateButton } from "@/components/certificate-button";

import { NavbarRoutes } from "@/components/navbar-routes";

import { CourseMobileSidebar } from "./course-mobile-sidebar";
import { SafeProfile } from "@/types";

interface CourseNavbarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
  currentProfile?: SafeProfile | null;
}

export const CourseNavbar = ({
  course,
  progressCount,
  currentProfile,
}: CourseNavbarProps) => {
  const isComplete = progressCount === 100;

  return (
    <div className="p-4 border-b h-full flex items-center shadow-sm">
      <CourseMobileSidebar course={course} progressCount={progressCount} />

      {/* Certificate Button - Only show when course is 100% complete */}
      {isComplete && (
        <div className="ml-auto mr-2">
          <CertificateButton
            courseId={course.id}
            courseName={course.title}
            isComplete={isComplete}
          />
        </div>
      )}

      <NavbarRoutes currentProfile={currentProfile} />
    </div>
  );
};

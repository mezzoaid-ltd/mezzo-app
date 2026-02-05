// =============================================================================
// STUDENT DASHBOARD WITH SEO
// Replace: app/(dashboard)/(routes)/(root)/page.tsx
// =============================================================================

import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CheckCircle, Clock, BookOpen, Target } from "lucide-react";

import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import { getStudentDashboardStats } from "@/actions/get-student-dashboard-stats";
import { CoursesList } from "@/components/courses-list";

import { InfoCard } from "./_components/info-card";
import { BannerCard } from "./_components/banner-card";
import { ProgressRing } from "./_components/progress-ring";
import { RecentActivity } from "./_components/recent-activity";

// =============================================================================
// STATIC METADATA (Dashboard is private, doesn't need dynamic metadata)
// =============================================================================
export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Track your learning progress, view enrolled courses, and continue your entrepreneurship journey on Mezzo Aid.",
  robots: {
    index: false, // Dashboard is private, don't index
    follow: false,
  },
};

// =============================================================================
// PAGE COMPONENT
// =============================================================================
export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch both in parallel
  const [dashboardCourses, stats] = await Promise.all([
    getDashboardCourses(user.id),
    getStudentDashboardStats(user.id),
  ]);

  const { completedCourses, coursesInProgress } = dashboardCourses;

  return (
    <div className="p-6 space-y-6">
      {/* Welcome banner */}
      <BannerCard
        icon={Target}
        label="Welcome to Mezzo Aid"
        description="Track your entrepreneurship journey through our gamified Quest system. Complete steps, earn badges, and build your business readiness score."
      />

      {/* Top row: 4 stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard
          icon={Clock}
          label="In Progress"
          numberOfItems={coursesInProgress.length}
        />
        <InfoCard
          icon={CheckCircle}
          label="Completed"
          numberOfItems={completedCourses.length}
          variant="success"
        />
        <InfoCard
          icon={BookOpen}
          label="Chapters Done"
          numberOfItems={stats.totalChaptersCompleted}
          totalItems={stats.totalChaptersAvailable}
        />
        <InfoCard
          icon={Target}
          label="Avg Progress"
          numberOfItems={stats.averageProgress}
          variant="default"
          isPercentage
        />
      </div>

      {/* Middle row: Progress ring + Recent activity side by side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress ring card */}
        <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 dark:border-gray-700 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            <ProgressRing progress={stats.averageProgress} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
            {stats.totalChaptersCompleted} of {stats.totalChaptersAvailable}{" "}
            chapters completed
          </p>
        </div>

        {/* Recent activity card */}
        <div className="md:col-span-2 border rounded-lg p-6 bg-white dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <RecentActivity activities={stats.recentActivity} />
        </div>
      </div>

      {/* Course list */}
      <CoursesList items={[...coursesInProgress, ...completedCourses]} />
    </div>
  );
}

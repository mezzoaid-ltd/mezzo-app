import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Users,
  BookOpen,
  Star,
  DollarSign,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";

import { getTeacherDashboardStats } from "@/actions/get-teacher-dashboard-stats";
import { DataCard } from "./_components/data-card";
import { Chart } from "./_components/chart";
import { EnrollmentChart } from "./_components/enrollment-chart";

const AnalyticsPage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const stats = await getTeacherDashboardStats(user.id);

  return (
    <div className="p-6 space-y-6">
      {/* Top row: 6 stat cards in a responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DataCard
          label="Total Revenue"
          value={stats.totalRevenue}
          shouldFormat
          icon={DollarSign}
          trend="Revenue from all course sales"
        />
        <DataCard
          label="Total Sales"
          value={stats.totalSales}
          shouldFormat={false}
          icon={ShoppingCart}
          trend="Individual course purchases"
        />
        <DataCard
          label="Total Students"
          value={stats.totalStudents}
          shouldFormat={false}
          icon={Users}
          trend="Unique enrolled students"
        />
        <DataCard
          label="Total Courses"
          value={stats.totalCourses}
          shouldFormat={false}
          icon={BookOpen}
          trend="Courses you've created"
        />
        <DataCard
          label="Avg Rating"
          value={stats.averageRating}
          shouldFormat={false}
          icon={Star}
          trend="Across all your courses"
          isDecimal
        />
        <DataCard
          label="Avg Revenue/Course"
          value={
            stats.totalCourses > 0
              ? Math.round(stats.totalRevenue / stats.totalCourses)
              : 0
          }
          shouldFormat
          icon={TrendingUp}
          trend="Revenue per course"
        />
      </div>

      {/* Charts row: Revenue by course + Enrollment trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Chart data={stats.revenueByourse} />
        <EnrollmentChart data={stats.enrollmentByMonth} />
      </div>
    </div>
  );
};

export default AnalyticsPage;

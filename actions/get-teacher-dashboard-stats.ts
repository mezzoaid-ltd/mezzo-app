import { createClient } from "@/lib/supabase/server";

interface MonthlyEnrollment {
  name: string;
  students: number;
}

interface TeacherDashboardStats {
  totalRevenue: number;
  totalSales: number;
  totalStudents: number;
  totalCourses: number;
  averageRating: number;
  revenueByourse: { name: string; total: number }[];
  enrollmentByMonth: MonthlyEnrollment[];
}

// Explicit types for each query result
type CourseRow = { id: string; title: string; price: number | null };
type PurchaseRow = {
  id: string;
  user_id: string;
  course_id: string;
  created_at: string;
};
type ReviewRow = { rating: number };

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const getTeacherDashboardStats = async (
  userId: string,
): Promise<TeacherDashboardStats> => {
  try {
    const supabase = await createClient();

    // 1. Get all courses owned by this teacher
    const { data: coursesRaw, error: coursesError } = await supabase
      .from("courses")
      .select("id, title, price")
      .eq("user_id", userId);

    const courses = (coursesRaw || []) as unknown as CourseRow[];

    if (coursesError || courses.length === 0) {
      return {
        totalRevenue: 0,
        totalSales: 0,
        totalStudents: 0,
        totalCourses: 0,
        averageRating: 0,
        revenueByourse: [],
        enrollmentByMonth: [],
      };
    }

    const courseIds = courses.map((c) => c.id);
    const totalCourses = courses.length;

    // Course price map
    const coursePriceMap: Record<string, { title: string; price: number }> = {};
    for (const c of courses) {
      coursePriceMap[c.id] = { title: c.title, price: c.price || 0 };
    }

    // 2. Get all purchases for this teacher's courses
    const { data: purchasesRaw, error: purchasesError } = await supabase
      .from("purchases")
      .select("id, user_id, course_id, created_at")
      .in("course_id", courseIds);

    if (purchasesError) {
      console.error(
        "[GET_TEACHER_DASHBOARD_STATS] purchases error:",
        purchasesError,
      );
    }

    const allPurchases = (purchasesRaw || []) as unknown as PurchaseRow[];
    const totalSales = allPurchases.length;

    // Unique students (distinct user_ids)
    const uniqueStudents = new Set(allPurchases.map((p) => p.user_id));
    const totalStudents = uniqueStudents.size;

    // Revenue by course
    const revenueByCourseMap: Record<string, number> = {};
    let totalRevenue = 0;

    for (const purchase of allPurchases) {
      const courseInfo = coursePriceMap[purchase.course_id];
      if (courseInfo) {
        if (!revenueByCourseMap[courseInfo.title]) {
          revenueByCourseMap[courseInfo.title] = 0;
        }
        revenueByCourseMap[courseInfo.title] += courseInfo.price;
        totalRevenue += courseInfo.price;
      }
    }

    const revenueByourse = Object.entries(revenueByCourseMap).map(
      ([name, total]) => ({ name, total }),
    );

    // 3. Monthly enrollment for the current year
    const now = new Date();
    const currentYear = now.getFullYear();

    const enrollmentByMonth: MonthlyEnrollment[] = MONTH_NAMES.map((name) => ({
      name,
      students: 0,
    }));

    for (const purchase of allPurchases) {
      const purchaseDate = new Date(purchase.created_at);
      if (purchaseDate.getFullYear() === currentYear) {
        const monthIndex = purchaseDate.getMonth();
        enrollmentByMonth[monthIndex].students += 1;
      }
    }

    // 4. Average rating across all teacher's courses (from reviews)
    const { data: reviewsRaw, error: reviewsError } = await supabase
      .from("reviews")
      .select("rating")
      .in("course_id", courseIds);

    if (reviewsError) {
      console.error(
        "[GET_TEACHER_DASHBOARD_STATS] reviews error:",
        reviewsError,
      );
    }

    const allReviews = (reviewsRaw || []) as unknown as ReviewRow[];
    const averageRating =
      allReviews.length > 0
        ? Math.round(
            (allReviews.reduce((sum, r) => sum + r.rating, 0) /
              allReviews.length) *
              10,
          ) / 10
        : 0;

    return {
      totalRevenue,
      totalSales,
      totalStudents,
      totalCourses,
      averageRating,
      revenueByourse,
      enrollmentByMonth,
    };
  } catch (error) {
    console.error("[GET_TEACHER_DASHBOARD_STATS]", error);
    return {
      totalRevenue: 0,
      totalSales: 0,
      totalStudents: 0,
      totalCourses: 0,
      averageRating: 0,
      revenueByourse: [],
      enrollmentByMonth: [],
    };
  }
};

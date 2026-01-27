import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/types";

type Purchase = Database["public"]["Tables"]["purchases"]["Row"];
type Course = Database["public"]["Tables"]["courses"]["Row"];

type PurchaseWithCourse = Purchase & {
  course: Pick<Course, "id" | "title" | "price" | "user_id"> | null;
};

const groupByCourse = (purchases: PurchaseWithCourse[]) => {
  const grouped: { [courseTitle: string]: number } = {};

  purchases.forEach((purchase) => {
    if (purchase.course) {
      const courseTitle = purchase.course.title;
      if (!grouped[courseTitle]) {
        grouped[courseTitle] = 0;
      }
      grouped[courseTitle] += purchase.course.price || 0;
    }
  });

  return grouped;
};

export const getAnalytics = async (userId: string) => {
  try {
    const supabase = await createClient();

    // Get all purchases for courses owned by this user
    const { data: purchases, error } = await supabase
      .from("purchases")
      .select(
        `
        *,
        course:courses!inner(id, title, price, user_id)
      `,
      )
      .eq("course.user_id", userId);

    if (error) {
      console.error("[GET_ANALYTICS]", error);
      return {
        data: [],
        totalRevenue: 0,
        totalSales: 0,
      };
    }

    if (!purchases || purchases.length === 0) {
      return {
        data: [],
        totalRevenue: 0,
        totalSales: 0,
      };
    }

    // Type assertion for Supabase joined data
    const purchasesWithCourse = purchases as unknown as PurchaseWithCourse[];

    // Filter out purchases where course is null (shouldn't happen with inner join)
    const validPurchases = purchasesWithCourse.filter((p) => p.course !== null);

    const groupedEarnings = groupByCourse(validPurchases);
    const data = Object.entries(groupedEarnings).map(
      ([courseTitle, total]) => ({
        name: courseTitle,
        total: total,
      }),
    );

    const totalRevenue = data.reduce((acc, curr) => acc + curr.total, 0);
    const totalSales = validPurchases.length;

    return {
      data,
      totalRevenue,
      totalSales,
    };
  } catch (error) {
    console.log("[GET_ANALYTICS]", error);
    return {
      data: [],
      totalRevenue: 0,
      totalSales: 0,
    };
  }
};

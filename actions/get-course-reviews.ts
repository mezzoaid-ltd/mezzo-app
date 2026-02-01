import { createClient } from "@/lib/supabase/server";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    user_id: string;
    name: string;
    image_url: string | null;
  };
}

interface CourseReviewsData {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  userReview: Review | null;
}

export const getCourseReviews = async (
  courseId: string,
  userId: string,
): Promise<CourseReviewsData> => {
  try {
    const supabase = await createClient();

    // Get all reviews with user info
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        user:profiles!reviews_user_id_fkey(
          id,
          user_id,
          name,
          image_url
        )
      `,
      )
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET_COURSE_REVIEWS]", error);
      return {
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        userReview: null,
      };
    }

    const reviewsData = (reviews || []) as unknown as Review[];

    // Calculate statistics
    const totalReviews = reviewsData.length;
    const averageRating =
      totalReviews > 0
        ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    const breakdown = {
      5: reviewsData.filter((r) => r.rating === 5).length,
      4: reviewsData.filter((r) => r.rating === 4).length,
      3: reviewsData.filter((r) => r.rating === 3).length,
      2: reviewsData.filter((r) => r.rating === 2).length,
      1: reviewsData.filter((r) => r.rating === 1).length,
    };

    // Find user's own review
    const userReview = reviewsData.find((r) => r.user_id === userId) || null;

    return {
      reviews: reviewsData,
      averageRating,
      totalReviews,
      breakdown,
      userReview,
    };
  } catch (error) {
    console.error("[GET_COURSE_REVIEWS]", error);
    return {
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      userReview: null,
    };
  }
};

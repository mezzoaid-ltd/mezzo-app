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

// Explicit types for separate queries
type ReviewRow = {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  user_id: string;
  name: string;
  image_url: string | null;
};

export const getCourseReviews = async (
  courseId: string,
  userId: string,
): Promise<CourseReviewsData> => {
  try {
    const supabase = await createClient();

    // Get all reviews for this course
    const { data: reviewsRaw, error } = await supabase
      .from("reviews")
      .select("*")
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

    const reviewsData = (reviewsRaw || []) as unknown as ReviewRow[];

    // If no reviews, return early
    if (reviewsData.length === 0) {
      return {
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        userReview: null,
      };
    }

    // Get unique user IDs from reviews (use Array.from instead of spread)
    const userIds = Array.from(new Set(reviewsData.map((r) => r.user_id)));

    // Fetch all user profiles in one query
    const { data: profilesRaw } = await supabase
      .from("profiles")
      .select("id, user_id, name, image_url")
      .in("user_id", userIds);

    const profiles = (profilesRaw || []) as unknown as ProfileRow[];

    // Create a map for quick lookup
    const profileMap: Record<string, ProfileRow> = {};
    for (const profile of profiles) {
      profileMap[profile.user_id] = profile;
    }

    // Merge reviews with user data
    const reviews: Review[] = reviewsData.map((review) => ({
      ...review,
      user: profileMap[review.user_id] || {
        id: "",
        user_id: review.user_id,
        name: "Unknown User",
        image_url: null,
      },
    }));

    // Calculate statistics
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    const breakdown = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    // Find user's own review
    const userReview = reviews.find((r) => r.user_id === userId) || null;

    return {
      reviews,
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

"use client";

import { RatingStats } from "@/app/(course)/courses/[courseId]/_components/rating-stats";
import { ReviewForm } from "@/app/(course)/courses/[courseId]/_components/review-form";
import { ReviewsList } from "@/app/(course)/courses/[courseId]/_components/reviews-list";
import { useState } from "react";


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

interface ReviewsSectionProps {
  courseId: string;
  currentUserId: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  breakdown: { 5: number; 4: number; 3: number; 2: number; 1: number };
  userReview: Review | null;
}

export const ReviewsSection = ({
  courseId,
  currentUserId,
  reviews,
  averageRating,
  totalReviews,
  breakdown,
  userReview,
}: ReviewsSectionProps) => {
  // Controls whether the form is visible (new review or editing existing one)
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Reviews & Ratings
        </h3>
        {/* Toggle button: show form to write/edit, or collapse it */}
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {showForm
            ? "Cancel"
            : userReview
              ? "Edit Your Review"
              : "Leave a Review"}
        </button>
      </div>

      {/* Rating stats bar — always visible */}
      <RatingStats
        averageRating={averageRating}
        totalReviews={totalReviews}
        breakdown={breakdown}
      />

      {/* Review form — only when toggled open */}
      {showForm && (
        <ReviewForm
          courseId={courseId}
          existingReview={userReview}
        />
      )}

      {/* Reviews list */}
      <ReviewsList
        reviews={reviews}
        currentUserId={currentUserId}
        courseId={courseId}
        onEditReview={() => setShowForm(true)}
      />
    </div>
  );
};
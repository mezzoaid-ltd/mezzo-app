"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ReviewFormProps {
  courseId: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
}

export const ReviewForm = ({ courseId, existingReview }: ReviewFormProps) => {
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setIsSubmitting(true);

      if (existingReview) {
        // Update existing review
        await axios.patch(`/api/courses/${courseId}/reviews`, {
          rating,
          comment,
        });
        toast.success("Review updated successfully");
      } else {
        // Create new review
        await axios.post(`/api/courses/${courseId}/reviews`, {
          rating,
          comment,
        });
        toast.success("Review submitted successfully");
      }

      router.refresh();
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error("You must purchase this course to leave a review");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingReview ? "Update Your Review" : "Leave a Review"}
        </CardTitle>
        <CardDescription>
          Share your experience with this course
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setRating(index + 1)}
                  onMouseEnter={() => setHoveredRating(index + 1)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                  disabled={isSubmitting}
                >
                  <Star
                    className={cn(
                      "h-8 w-8",
                      index < displayRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600",
                    )}
                  />
                </button>
              ))}
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                {displayRating > 0
                  ? `${displayRating} star${displayRating > 1 ? "s" : ""}`
                  : "Select rating"}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Your Review (Optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this course..."
              className="min-h-[120px]"
              disabled={isSubmitting}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            {existingReview && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRating(existingReview.rating);
                  setComment(existingReview.comment || "");
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || rating === 0}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {existingReview ? "Update Review" : "Submit Review"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

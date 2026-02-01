"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import Image from "next/image";

import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Review {
  id: string;
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

interface ReviewsListProps {
  reviews: Review[];
  currentUserId: string;
  courseId: string;
  onEditReview: () => void;
}

export const ReviewsList = ({
  reviews,
  currentUserId,
  courseId,
  onEditReview,
}: ReviewsListProps) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/courses/${courseId}/reviews`);
      toast.success("Review deleted");
      setShowDeleteDialog(false);
      setDeletingId(null);
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p>No reviews yet. Be the first to review this course!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {reviews.map((review) => {
          const isOwnReview = review.user.user_id === currentUserId;

          return (
            <div
              key={review.id}
              className="border rounded-lg p-6 bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={review.user.image_url || undefined}
                      alt={review.user.name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                      {getInitials(review.user.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {review.user.name}
                      </h4>
                      {isOwnReview && (
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(review.created_at), "MMM d, yyyy")}
                      </span>
                      {review.updated_at !== review.created_at && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          (edited)
                        </span>
                      )}
                    </div>

                    {review.comment && (
                      <p className="text-gray-700 dark:text-gray-300 mt-2">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions Menu */}
                {isOwnReview && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={onEditReview}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setDeletingId(review.id);
                          setShowDeleteDialog(true);
                        }}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your review? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

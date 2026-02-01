"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export const StarRating = ({
  rating,
  totalStars = 5,
  size = "md",
  showNumber = false,
  interactive = false,
  onChange,
}: StarRatingProps) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: totalStars }).map((_, index) => {
        const isFilled = index < Math.floor(rating);
        const isHalfFilled = index < rating && index >= Math.floor(rating);

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            disabled={!interactive}
            className={cn(
              "relative",
              interactive &&
                "cursor-pointer hover:scale-110 transition-transform",
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled && "fill-yellow-400 text-yellow-400",
                isHalfFilled && "fill-yellow-400/50 text-yellow-400",
                !isFilled &&
                  !isHalfFilled &&
                  "text-gray-300 dark:text-gray-600",
              )}
            />
          </button>
        );
      })}
      {showNumber && (
        <span
          className={cn(
            "ml-1 font-medium text-gray-700 dark:text-gray-300",
            textSizeClasses[size],
          )}
        >
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

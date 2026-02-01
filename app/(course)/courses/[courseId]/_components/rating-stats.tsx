import { StarRating } from "@/components/star-rating";
import { Progress } from "@/components/ui/progress";

interface RatingStatsProps {
  averageRating: number;
  totalReviews: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export const RatingStats = ({
  averageRating,
  totalReviews,
  breakdown,
}: RatingStatsProps) => {
  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
      <div className="flex items-start gap-8">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
            {averageRating.toFixed(1)}
          </div>
          <StarRating rating={averageRating} size="md" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Rating Breakdown */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = breakdown[stars as keyof typeof breakdown] || 0;
            const percentage = getPercentage(count);

            return (
              <div key={stars} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                  {stars} star{stars !== 1 && "s"}
                </span>
                <Progress value={percentage} className="flex-1 h-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

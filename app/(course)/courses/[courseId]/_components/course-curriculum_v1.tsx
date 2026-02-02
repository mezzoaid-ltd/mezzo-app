"use client";

import { CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Chapter {
  id: string;
  title: string;
  description: string | null;
  position: number;
  is_free: boolean;
  is_published: boolean;
}

interface CourseCurriculumProps {
  chapters: Chapter[];
  isPurchased: boolean;
}

export const CourseCurriculum = ({
  chapters,
  isPurchased,
}: CourseCurriculumProps) => {
  if (chapters.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No chapters available yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chapters.map((chapter, index) => {
        const isAccessible = isPurchased || chapter.is_free;

        return (
          <div
            key={chapter.id}
            className={cn(
              "border rounded-lg p-4 transition-colors",
              isAccessible
                ? "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border-gray-200 dark:border-gray-700"
                : "bg-gray-50 dark:bg-gray-850 border-gray-200 dark:border-gray-700",
            )}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={cn(
                  "rounded-full p-2 mt-0.5",
                  isAccessible
                    ? "bg-indigo-100 dark:bg-indigo-900"
                    : "bg-gray-200 dark:bg-gray-700",
                )}
              >
                {isAccessible ? (
                  <PlayCircle
                    className={cn(
                      "h-4 w-4",
                      "text-indigo-600 dark:text-indigo-400",
                    )}
                  />
                ) : (
                  <Lock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p
                      className={cn(
                        "font-medium text-sm",
                        isAccessible
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-500 dark:text-gray-400",
                      )}
                    >
                      {index + 1}. {chapter.title}
                    </p>
                    {chapter.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {chapter.description}
                      </p>
                    )}
                  </div>

                  {/* Badge */}
                  {chapter.is_free && !isPurchased && (
                    <span className="text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded whitespace-nowrap">
                      Free Preview
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

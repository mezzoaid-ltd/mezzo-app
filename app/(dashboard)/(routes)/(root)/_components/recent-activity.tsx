"use client";

import { CheckCircle2 } from "lucide-react";
import { formatDistance } from "date-fns";

interface ActivityItem {
  id: string;
  chapterTitle: string;
  courseTitle: string;
  completedAt: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export const RecentActivity = ({ activities }: RecentActivityProps) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
        No activity yet. Start a course to see your progress here.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {activities.map((activity, index) => (
        <div key={activity.id} className="flex gap-3">
          {/* Icon + connector line */}
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-indigo-100 dark:bg-indigo-900 p-1.5">
              <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            {/* Vertical connector line — not on last item */}
            {index < activities.length - 1 && (
              <div className="w-0.5 h-full min-h-[32px] bg-gray-200 dark:bg-gray-700 my-1" />
            )}
          </div>

          {/* Content */}
          <div className="pb-4 pt-0.5 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
              {activity.chapterTitle}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {activity.courseTitle}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {formatDistance(new Date(activity.completedAt), new Date(), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

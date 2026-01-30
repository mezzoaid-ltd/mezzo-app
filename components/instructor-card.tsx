"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, BookOpen } from "lucide-react";

interface InstructorCardProps {
  instructorId: string;
  name: string;
  title?: string | null;
  imageUrl?: string | null;
  totalCourses?: number;
  totalStudents?: number;
  compact?: boolean;
}

export const InstructorCard = ({
  instructorId,
  name,
  title,
  imageUrl,
  totalCourses,
  totalStudents,
  compact = false,
}: InstructorCardProps) => {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (compact) {
    // Compact version for course cards
    return (
      <Link
        href={`/instructor/${instructorId}`}
        className="flex items-center gap-2 hover:opacity-75 transition group"
        onClick={(e) => e.stopPropagation()}
      >
        <Avatar className="h-6 w-6 border border-gray-200 dark:border-gray-700">
          <AvatarImage src={imageUrl || undefined} alt={name} />
          <AvatarFallback className="text-xs bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
            {name}
          </span>
          {title && (
            <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
              {title}
            </span>
          )}
        </div>
      </Link>
    );
  }

  // Full card version for instructor listings
  return (
    <Link
      href={`/instructor/${instructorId}`}
      className="group block border rounded-lg p-4 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 border-2 border-gray-200 dark:border-gray-700 group-hover:border-indigo-400 dark:group-hover:border-indigo-600 transition">
          <AvatarImage src={imageUrl || undefined} alt={name} />
          <AvatarFallback className="text-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-1">
            {name}
          </h3>
          {title && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-3">
              {title}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            {totalCourses !== undefined && (
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-indigo-500" />
                <span className="font-medium">
                  {totalCourses} {totalCourses === 1 ? "course" : "courses"}
                </span>
              </div>
            )}
            {totalStudents !== undefined && (
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-indigo-500" />
                <span className="font-medium">
                  {totalStudents.toLocaleString()}{" "}
                  {totalStudents === 1 ? "student" : "students"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

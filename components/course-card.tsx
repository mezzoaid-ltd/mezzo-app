"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { formatPrice } from "@/lib/format";
import { CourseProgress } from "@/components/course-progress";
import { InstructorCard } from "@/components/instructor-card";

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string;
  chaptersLength: number;
  price: number;
  progress: number | null;
  category: string;
  instructor?: {
    id: string;
    name: string;
    title?: string | null;
    image_url?: string | null;
  } | null;
}

export const CourseCard = ({
  id,
  title,
  imageUrl,
  chaptersLength,
  price,
  progress,
  category,
  instructor,
}: CourseCardProps) => {
  return (
    <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full dark:border-gray-700 dark:bg-gray-800">
      {/* Image Link */}
      <Link href={`/courses/${id}`}>
        <div className="relative w-full aspect-video rounded-md overflow-hidden">
          <Image
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            alt={title}
            src={imageUrl}
          />
        </div>
      </Link>

      <div className="flex flex-col pt-2">
        {/* Title Link */}
        <Link href={`/courses/${id}`}>
          <div className="text-lg md:text-base font-medium group-hover:text-sky-700 dark:group-hover:text-sky-400 transition line-clamp-2 dark:text-white min-h-[3rem]">
            {title}
          </div>
        </Link>

        {/* Instructor Info - Separate Link (No nesting) */}
        {instructor && (
          <div className="my-3">
            <InstructorCard
              instructorId={instructor.id}
              name={instructor.name}
              title={instructor.title}
              imageUrl={instructor.image_url}
              compact
            />
          </div>
        )}

        <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
          {category}
        </p>

        <div className="my-3 flex items-center gap-x-2 text-sm md:text-xs">
          <div className="flex items-center gap-x-1 text-slate-500 dark:text-gray-400">
            <IconBadge size="sm" icon={BookOpen} />
            <span>
              {chaptersLength} {chaptersLength === 1 ? "Chapter" : "Chapters"}
            </span>
          </div>
        </div>

        {progress !== null ? (
          <CourseProgress
            variant={progress === 100 ? "success" : "default"}
            size="sm"
            value={progress}
          />
        ) : (
          <p className="text-md md:text-sm font-medium text-slate-700 dark:text-gray-300">
            {formatPrice(price)}
          </p>
        )}
      </div>
    </div>
  );
};

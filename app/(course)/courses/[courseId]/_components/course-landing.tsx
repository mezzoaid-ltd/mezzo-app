"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock, Users, Star, PlayCircle } from "lucide-react";
import MuxPlayer from "@mux/mux-player-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { formatPrice } from "@/lib/format";
import { CourseCurriculum } from "./course-curriculum";
import { RatingStats } from "./rating-stats";
import { ReviewsList } from "./reviews-list";
import { StarRating } from "@/components/star-rating";

interface Chapter {
  id: string;
  title: string;
  description: string | null;
  position: number;
  is_free: boolean;
  is_published: boolean;
}

interface Instructor {
  id: string;
  user_id: string;
  name: string;
  image_url: string | null;
  title: string | null;
  bio: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  instructor: Instructor | null;
  category: Category | null;
}

interface ReviewsData {
  reviews: any[];
  averageRating: number;
  totalReviews: number;
  breakdown: { 5: number; 4: number; 3: number; 2: number; 1: number };
  userReview: any;
}

interface CourseLandingProps {
  course: Course;
  chapters: Chapter[];
  previewChapter: Chapter | null;
  previewPlaybackId: string | null;
  isPurchased: boolean;
  currentUserId: string;
  reviewsData: ReviewsData;
}

export const CourseLanding = ({
  course,
  chapters,
  previewChapter,
  previewPlaybackId,
  isPurchased,
  currentUserId,
  reviewsData,
}: CourseLandingProps) => {
  const [activeTab, setActiveTab] = useState<
    "about" | "curriculum" | "reviews"
  >("about");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Course Info */}
            <div className="lg:col-span-2 space-y-4">
              {course.category && (
                <span className="inline-block text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                  {course.category.name}
                </span>
              )}
              <h1 className="text-4xl font-bold">{course.title}</h1>
              {course.description && (
                <p className="text-lg text-white/90 line-clamp-3">
                  {course.description.replace(/<[^>]*>/g, "")}
                </p>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {reviewsData.totalReviews > 0 && (
                  <div className="flex items-center gap-2">
                    <StarRating
                      rating={reviewsData.averageRating}
                      size="sm"
                      showNumber
                    />
                    <span className="text-white/80">
                      ({reviewsData.totalReviews}{" "}
                      {reviewsData.totalReviews === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{chapters.length} chapters</span>
                </div>
              </div>

              {/* Instructor */}
              {course.instructor && (
                <div className="flex items-center gap-3 pt-4">
                  {/* Avatar with better fallback handling */}
                  {course.instructor.image_url ? (
                    <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-white/30">
                      <Image
                        src={course.instructor.image_url}
                        alt={course.instructor.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold border-2 border-white/30">
                      {getInitials(course.instructor.name)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-white/70">Instructor</p>
                    <p className="font-semibold">{course.instructor.name}</p>
                    {course.instructor.title && (
                      <p className="text-sm text-white/80">
                        {course.instructor.title}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Preview or Enroll Card */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 space-y-4 sticky top-6">
                {/* Preview Video Thumbnail or Placeholder */}
                {previewPlaybackId ? (
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    <MuxPlayer
                      playbackId={previewPlaybackId}
                      className="w-full h-full"
                    />
                  </div>
                ) : course.image_url ? (
                  <div className="aspect-video rounded-lg overflow-hidden relative">
                    <Image
                      src={course.image_url}
                      alt={course.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <PlayCircle className="h-16 w-16 text-white opacity-80" />
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <PlayCircle className="h-16 w-16 text-gray-400" />
                  </div>
                )}

                {/* Price */}
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {course.price ? formatPrice(course.price) : "Free"}
                  </p>
                </div>

                {/* CTA Button */}
                {isPurchased ? (
                  <Button asChild className="w-full" size="lg">
                    <Link
                      href={`/courses/${course.id}/chapters/${chapters[0]?.id}`}
                    >
                      Continue Learning
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full" size="lg">
                    <Link
                      href={`/courses/${course.id}/chapters/${chapters[0]?.id}`}
                    >
                      {course.price ? "Enroll Now" : "Start Learning"}
                    </Link>
                  </Button>
                )}

                {/* Free preview notice */}
                {!isPurchased && chapters.some((ch) => ch.is_free) && (
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    Preview {chapters.filter((ch) => ch.is_free).length} free{" "}
                    {chapters.filter((ch) => ch.is_free).length === 1
                      ? "chapter"
                      : "chapters"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Tabs Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex gap-8">
                <button
                  onClick={() => setActiveTab("about")}
                  className={`pb-4 text-sm font-medium transition-colors ${
                    activeTab === "about"
                      ? "border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => setActiveTab("curriculum")}
                  className={`pb-4 text-sm font-medium transition-colors ${
                    activeTab === "curriculum"
                      ? "border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  Curriculum ({chapters.length})
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-4 text-sm font-medium transition-colors ${
                    activeTab === "reviews"
                      ? "border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  Reviews ({reviewsData.totalReviews})
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              {activeTab === "about" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      About This Course
                    </h2>
                    {course.description ? (
                      <Preview value={course.description} />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">
                        No description available.
                      </p>
                    )}
                  </div>

                  {course.instructor && course.instructor.bio && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                          About the Instructor
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {course.instructor.bio}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "curriculum" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Course Curriculum
                  </h2>
                  <CourseCurriculum
                    chapters={chapters}
                    isPurchased={isPurchased}
                  />
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Student Reviews
                  </h2>
                  {reviewsData.totalReviews > 0 && (
                    <RatingStats
                      averageRating={reviewsData.averageRating}
                      totalReviews={reviewsData.totalReviews}
                      breakdown={reviewsData.breakdown}
                    />
                  )}
                  <ReviewsList
                    reviews={reviewsData.reviews}
                    currentUserId={currentUserId}
                    courseId={course.id}
                    onEditReview={() => {}}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right: Empty for now (could add related courses, etc.) */}
          <div className="lg:col-span-1">
            {/* Placeholder for future features like related courses */}
          </div>
        </div>
      </div>
    </div>
  );
};

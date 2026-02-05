// =============================================================================
// CHAPTER PAGE WITH SEO (Student View)
// Replace: app/(course)/courses/[courseId]/chapters/[chapterId]/page.tsx
// =============================================================================

import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { File } from "lucide-react";

import { getChapter } from "@/actions/get-chapter";
import { getCourseReviews } from "@/actions/get-course-reviews";
import { trackLastViewed } from "@/actions/track-last-viewed";
import { Banner } from "@/components/banner";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";

import { VideoPlayer } from "./_components/video-player";
import { CourseEnrollButton } from "./_components/course-enroll-button";
import { CourseProgressButton } from "./_components/course-progress-button";
import { ReviewsSection } from "../../_components/reviews-section";
import { siteConfig } from "@/lib/seo-config";

interface ChapterPageProps {
  params: { courseId: string; chapterId: string };
}

// =============================================================================
// DYNAMIC METADATA
// =============================================================================
export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const supabase = await createClient();

  // Get chapter and course info
  const { data: chapterRaw } = await supabase
    .from("chapters")
    .select("title, description")
    .eq("id", params.chapterId)
    .single();

  const { data: courseRaw } = await supabase
    .from("courses")
    .select("title")
    .eq("id", params.courseId)
    .single();

  const chapter = chapterRaw as {
    title: string;
    description: string | null;
  } | null;
  const course = courseRaw as { title: string } | null;

  if (!chapter || !course) {
    return {
      title: "Chapter Not Found",
    };
  }

  const title = `${chapter.title} - ${course.title}`;
  const description =
    chapter.description?.replace(/<[^>]*>/g, "").slice(0, 160) ||
    `Watch ${chapter.title} from the course "${course.title}" on Mezzo Aid.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/courses/${params.courseId}/chapters/${params.chapterId}`,
    },
    openGraph: {
      type: "article",
      title: `${title} | Mezzo Aid`,
      description,
      url: `${siteConfig.url}/courses/${params.courseId}/chapters/${params.chapterId}`,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.social.twitter,
      title: `${title} | Mezzo Aid`,
      description,
    },
    robots: {
      index: false, // Chapter pages are behind purchase, don't index
      follow: true,
    },
  };
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================
const ChapterIdPage = async ({ params }: ChapterPageProps) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const {
    chapter,
    course,
    muxData,
    attachments,
    nextChapter,
    userProgress,
    purchase,
  } = await getChapter({
    userId: user.id,
    chapterId: params.chapterId,
    courseId: params.courseId,
  });

  if (!chapter || !course) {
    return redirect("/");
  }

  const isLocked = !chapter.is_free && !purchase;
  const completeOnEnd = !!purchase && !userProgress?.is_completed;

  // Track last viewed chapter (fire and forget - don't await)
  if (purchase) {
    trackLastViewed(user.id, params.courseId, params.chapterId);
  }

  // Fetch reviews data if user has purchased
  const reviewsData = purchase
    ? await getCourseReviews(params.courseId, user.id)
    : null;

  return (
    <div>
      {userProgress?.is_completed && (
        <Banner variant="success" label="You already completed this chapter." />
      )}
      {isLocked && (
        <Banner
          variant="warning"
          label="You need to purchase this course to watch this chapter."
        />
      )}
      <div className="flex flex-col max-w-4xl mx-auto pb-20">
        <div className="p-4">
          <VideoPlayer
            chapterId={params.chapterId}
            title={chapter.title}
            courseId={params.courseId}
            nextChapterId={nextChapter?.id}
            playbackId={muxData?.playback_id!}
            isLocked={isLocked}
            completeOnEnd={completeOnEnd}
          />
        </div>
        <div>
          <div className="p-4 flex flex-col md:flex-row items-center justify-between">
            <h2 className="text-2xl font-semibold mb-2">{chapter.title}</h2>
            {purchase ? (
              <CourseProgressButton
                chapterId={params.chapterId}
                courseId={params.courseId}
                nextChapterId={nextChapter?.id}
                isCompleted={!!userProgress?.is_completed}
              />
            ) : (
              <CourseEnrollButton
                courseId={params.courseId}
                price={course.price!}
              />
            )}
          </div>
          <Separator />
          <div>
            <Preview value={chapter.description!} />
          </div>
          {!!attachments.length && (
            <>
              <Separator />
              <div className="p-4">
                {attachments.map((attachment) => (
                  <a
                    href={attachment.url}
                    target="_blank"
                    key={attachment.id}
                    className="flex items-center p-3 w-full bg-sky-200 dark:bg-sky-800 text-sky-700 dark:text-sky-300 hover:underline"
                  >
                    <File />
                    <p className="line-clamp-1">{attachment.name}</p>
                  </a>
                ))}
              </div>
            </>
          )}

          {/* Reviews Section — visible only to purchasers */}
          {purchase && reviewsData && (
            <>
              <Separator />
              <div className="p-4 mt-4">
                <ReviewsSection
                  courseId={params.courseId}
                  currentUserId={user.id}
                  reviews={reviewsData.reviews}
                  averageRating={reviewsData.averageRating}
                  totalReviews={reviewsData.totalReviews}
                  breakdown={reviewsData.breakdown}
                  userReview={reviewsData.userReview}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterIdPage;

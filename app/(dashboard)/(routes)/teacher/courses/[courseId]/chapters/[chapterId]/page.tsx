import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Eye, LayoutDashboard, Video } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { ChapterTitleForm } from "./_components/chatper-title-form";
import { ChapterDescriptionForm } from "./_components/chapter-description-form";
import { ChapterAccessForm } from "./_components/chapter-access-form";
import { ChapterVideoForm } from "./_components/chapter-video-form";
import { Banner } from "@/components/banner";
import { ChapterActions } from "./_components/chatper-actions";
import { Database } from "@/lib/supabase/types";

type Chapter = Database["public"]["Tables"]["chapters"]["Row"];
type MuxData = Database["public"]["Tables"]["mux_data"]["Row"];

interface ChapterIdPageProps {
  params: {
    courseId: string;
    chapterId: string;
  };
}

const ChapterIdPage: React.FC<ChapterIdPageProps> = async ({ params }) => {
  const { courseId, chapterId } = params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get chapter with mux data
  const { data: chapterData, error } = await supabase
    .from("chapters")
    .select(
      `
      *,
      mux_data:mux_data(*)
    `,
    )
    .eq("id", chapterId)
    .eq("course_id", courseId)
    .single();

  if (error || !chapterData) {
    return redirect("/teacher/courses");
  }

  // Type assertion for joined data
  const chapter = chapterData as unknown as Chapter & {
    mux_data: MuxData[];
  };

  // Transform mux_data array to single object (since it's a one-to-one relationship)
  const chapterWithMux = {
    id: chapter.id,
    title: chapter.title,
    description: chapter.description,
    video_url: chapter.video_url,
    position: chapter.position,
    is_published: chapter.is_published,
    is_free: chapter.is_free,
    course_id: chapter.course_id,
    created_at: chapter.created_at,
    updated_at: chapter.updated_at,
    muxData: chapter.mux_data?.[0] || null,
  };

  const requiredFields = [
    chapter.title,
    chapter.description,
    chapter.video_url,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!chapter.is_published && (
        <Banner
          variant="warning"
          label="This chapter is unpublished. It will not be visible in the course"
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              href={`/teacher/courses/${courseId}`}
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to course setup
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Chapter Creation</h1>
              </div>
            </div>
            <span className="text-sm text-slate-700 dark:text-slate-300 ">
              Complete all fields {completionText}
            </span>
          </div>
          <ChapterActions
            disabled={!isComplete}
            courseId={courseId}
            chapterId={chapterId}
            isPublished={chapter.is_published}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl font-medium">Customize your chapter</h2>
              </div>
              <ChapterTitleForm
                initialData={chapterWithMux}
                courseId={courseId}
                chapterId={chapterId}
              />
              <ChapterDescriptionForm
                initialData={chapterWithMux}
                courseId={courseId}
                chapterId={chapterId}
              />
            </div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Eye} />
              <h2 className="text-xl font-medium">Access Settings</h2>
            </div>
            <ChapterAccessForm
              initialData={chapterWithMux}
              courseId={courseId}
              chapterId={chapterId}
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Video} />
              <h2 className="text-xl font-medium">Add a video</h2>
            </div>
            <ChapterVideoForm
              initialData={chapterWithMux}
              courseId={courseId}
              chapterId={chapterId}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChapterIdPage;

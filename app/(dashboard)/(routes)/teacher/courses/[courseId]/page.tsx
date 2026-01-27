import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  CircleDollarSign,
  File,
  LayoutDashboard,
  ListChecks,
} from "lucide-react";

import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";

import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import { ImageForm } from "./_components/image-form";
import { CategoryForm } from "./_components/category-form";
import { PriceForm } from "./_components/price-form";
import { AttachmentForm } from "./_components/attachment-form";
import { ChaptersForm } from "./_components/chapters-form";
import { Actions } from "./_components/actions";
import { Database } from "@/lib/supabase/types";

type Course = Database["public"]["Tables"]["courses"]["Row"];
type Chapter = Database["public"]["Tables"]["chapters"]["Row"];
type Attachment = Database["public"]["Tables"]["attachments"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get course with chapters and attachments
  const { data: courseData, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      chapters(*),
      attachments(*)
    `,
    )
    .eq("id", params.courseId)
    .eq("user_id", user.id)
    .single();

  if (error || !courseData) {
    return redirect("/teacher/courses");
  }

  // Type assertion for joined data
  const course = courseData as unknown as Course & {
    chapters: Chapter[];
    attachments: Attachment[];
  };

  // Sort chapters by position
  const sortedChapters = (course.chapters || []).sort(
    (a, b) => a.position - b.position,
  );

  // Sort attachments by created_at
  const sortedAttachments = (course.attachments || []).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const courseWithSorted = {
    id: course.id,
    user_id: course.user_id,
    title: course.title,
    description: course.description,
    image_url: course.image_url,
    price: course.price,
    is_published: course.is_published,
    category_id: course.category_id,
    created_at: course.created_at,
    updated_at: course.updated_at,
    chapters: sortedChapters,
    attachments: sortedAttachments,
  };

  // Get categories
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  // Type assertion for categories
  const categories = (categoriesData || []) as Category[];

  const requiredFields = [
    course.title,
    course.description,
    course.image_url,
    course.price,
    course.category_id,
    course.chapters?.some((chapter) => chapter.is_published),
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields} / ${totalFields})`;

  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!course.is_published && (
        <Banner label="This course is unpublished. It will not be visible to the students." />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Course setup</h1>
            <span className="text-sm text-slate-700">
              Complete all fields {completionText}
            </span>
          </div>
          <Actions
            disabled={!isComplete}
            courseId={params.courseId}
            isPublished={course.is_published}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize your course</h2>
            </div>
            <TitleForm initialData={courseWithSorted} courseId={course.id} />
            <DescriptionForm
              initialData={courseWithSorted}
              courseId={course.id}
            />
            <ImageForm initialData={courseWithSorted} courseId={course.id} />
            <CategoryForm
              initialData={courseWithSorted}
              courseId={course.id}
              options={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
            />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-xl">Course chapters</h2>
              </div>
              <ChaptersForm
                initialData={courseWithSorted}
                courseId={course.id}
              />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={CircleDollarSign} />
                <h2 className="text-xl">Sell your course</h2>
              </div>
              <PriceForm initialData={courseWithSorted} courseId={course.id} />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={File} />
                <h2 className="text-xl">Resources & Attachments</h2>
              </div>
              <AttachmentForm
                initialData={courseWithSorted}
                courseId={course.id}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseIdPage;

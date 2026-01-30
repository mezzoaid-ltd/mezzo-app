import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, BookOpen, Users, Globe, Mail } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CoursesList } from "@/components/courses-list";
import { CourseWithProgressWithCategory } from "@/types";
import { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Course = Database["public"]["Tables"]["courses"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

interface InstructorPageProps {
  params: {
    instructorId: string;
  };
}

const InstructorPage = async ({ params }: InstructorPageProps) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get instructor profile
  const { data: instructor, error: instructorError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.instructorId)
    .single();

  if (instructorError || !instructor) {
    return redirect("/search");
  }

  // Cast instructor to proper type
  const instructorProfile = instructor as Profile;

  // Check if instructor is actually a teacher or admin
  if (instructorProfile.role === "STUDENT") {
    return redirect("/search");
  }

  // Get instructor's published courses
  const { data: coursesData } = await supabase
    .from("courses")
    .select(
      `
      *,
      category:categories(*)
    `,
    )
    .eq("user_id", params.instructorId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const courses = (coursesData || []) as unknown as Array<
    Course & { category: Category | null }
  >;

  // Get statistics
  const totalCourses = courses.length;

  // Get total students (unique purchasers across all courses)
  const { data: purchases } = await supabase
    .from("purchases")
    .select("user_id")
    .in(
      "course_id",
      courses.map((c) => c.id),
    );
  // @ts-ignore
  const uniqueStudents = new Set(purchases?.map((p) => p.user_id) || []).size;

  // Get courses with chapters for display - match CourseWithProgressWithCategory type
  const coursesWithChapters: CourseWithProgressWithCategory[] =
    await Promise.all(
      courses.map(async (course) => {
        const { data: chapters } = await supabase
          .from("chapters")
          .select("id")
          .eq("course_id", course.id)
          .eq("is_published", true);

        // Check if current user purchased
        const { data: purchase } = await supabase
          .from("purchases")
          .select("id")
          .eq("user_id", user.id)
          .eq("course_id", course.id)
          .maybeSingle();

        return {
          ...course,
          chapters: chapters || [],
          progress: purchase ? 0 : null,
          instructor: {
            id: instructorProfile.id,
            name: instructorProfile.name,
            title: instructorProfile.title,
            image_url: instructorProfile.image_url,
          },
        };
      }),
    );

  // Get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Parse social links
  const socialLinks =
    typeof instructorProfile.social_links === "object" &&
    instructorProfile.social_links
      ? (instructorProfile.social_links as {
          twitter?: string;
          linkedin?: string;
          github?: string;
          website?: string;
        })
      : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/search">
            <Button
              variant="ghost"
              className="mb-4 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to courses
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
              <AvatarImage
                src={instructorProfile.image_url || undefined}
                alt={instructorProfile.name}
              />
              <AvatarFallback className="text-4xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                {getInitials(instructorProfile.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-white">
              <h1 className="text-4xl font-bold mb-2">
                {instructorProfile.name}
              </h1>
              {instructorProfile.title && (
                <p className="text-xl text-indigo-100 mb-4">
                  {instructorProfile.title}
                </p>
              )}
              {instructorProfile.headline && (
                <p className="text-lg text-indigo-100 mb-4 max-w-3xl">
                  {instructorProfile.headline}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="font-semibold">
                    {totalCourses} {totalCourses === 1 ? "Course" : "Courses"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">
                    {uniqueStudents.toLocaleString()}{" "}
                    {uniqueStudents === 1 ? "Student" : "Students"}
                  </span>
                </div>
                {instructorProfile.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    <span>{instructorProfile.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            {instructorProfile.bio && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  About
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {instructorProfile.bio}
                </p>
              </div>
            )}

            {/* Courses Section */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Courses by {instructorProfile.name}
              </h2>
              <CoursesList items={coursesWithChapters} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                Contact
              </h3>
              <div className="space-y-3">
                {instructorProfile.website_url && (
                  <a
                    href={instructorProfile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">Website</span>
                  </a>
                )}
                {socialLinks?.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${socialLinks.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    <span className="text-sm">LinkedIn</span>
                  </a>
                )}
                {socialLinks?.twitter && (
                  <a
                    href={`https://twitter.com/${socialLinks.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                    <span className="text-sm">Twitter</span>
                  </a>
                )}
                {socialLinks?.github && (
                  <a
                    href={`https://github.com/${socialLinks.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span className="text-sm">GitHub</span>
                  </a>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Courses
                  </span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {totalCourses}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Students
                  </span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {uniqueStudents.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorPage;

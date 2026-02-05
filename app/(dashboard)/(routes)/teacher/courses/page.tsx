// =============================================================================
// TEACHER COURSES PAGE WITH SEO
// Replace: app/(dashboard)/(routes)/teacher/courses/page.tsx
// =============================================================================

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";

// =============================================================================
// STATIC METADATA (Private page - noindex)
// =============================================================================
export const metadata: Metadata = {
  title: "My Courses",
  description:
    "Manage your courses on Mezzo Aid. Create, edit, and publish courses for your students.",
  robots: {
    index: false, // Private teacher page
    follow: false,
  },
};

// =============================================================================
// PAGE COMPONENT
// =============================================================================
const CoursesPage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get courses created by this user
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6">
      <DataTable columns={columns} data={courses || []} />
    </div>
  );
};

export default CoursesPage;

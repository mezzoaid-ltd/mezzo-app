import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";

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

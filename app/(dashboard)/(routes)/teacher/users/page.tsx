import { createClient } from "@/lib/supabase/server";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";

const UsersPage = async () => {
  const supabase = await createClient();

  // Fetch all user profiles
  const { data: userData } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6">
      <h1>Users</h1>
      <DataTable columns={columns} data={userData || []} />
    </div>
  );
};

export default UsersPage;

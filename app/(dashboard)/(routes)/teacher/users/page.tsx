// import { createClient } from "@/lib/supabase/server";
// import { DataTable } from "./_components/data-table";
// import { columns } from "./_components/columns";

// const UsersPage = async () => {
//   const supabase = await createClient();

//   // Fetch all user profiles
//   const { data: userData } = await supabase
//     .from("profiles")
//     .select("*")
//     .order("created_at", { ascending: false });

//   return (
//     <div className="p-6">
//       <h1>Users</h1>
//       <DataTable columns={columns} data={userData || []} />
//     </div>
//   );
// };

// export default UsersPage;

// =============================================================================
// TEACHER USERS PAGE WITH SEO
// Replace: app/(dashboard)/(routes)/teacher/users/page.tsx
// =============================================================================

import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";

// =============================================================================
// STATIC METADATA (Private admin page - noindex)
// =============================================================================
export const metadata: Metadata = {
  title: "Manage Users",
  description: "Manage user accounts and roles on Mezzo Aid.",
  robots: {
    index: false, // Private admin page
    follow: false,
  },
};

// =============================================================================
// PAGE COMPONENT
// =============================================================================
const UsersPage = async () => {
  const supabase = await createClient();

  // Fetch all user profiles
  const { data: userData } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <DataTable columns={columns} data={userData || []} />
    </div>
  );
};

export default UsersPage;

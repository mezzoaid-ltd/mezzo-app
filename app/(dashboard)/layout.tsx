import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/current-profile";
import { Sidebar } from "./_components/Sidebar";
import { Navbar } from "./_components/navbar";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const profile = await getCurrentProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  return (
    <div className="h-full dark:bg-gray-900">
      <div className="h-[80px] md:pl-56 fixed inset-y-0 w-full z-50 dark:bg-gray-900">
        <Navbar currentProfile={profile} />
      </div>

      <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50 dark:bg-gray-900">
        <Sidebar />
      </div>
      <main className="md:pl-56 pt-[80px] h-full dark:bg-gray-900">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

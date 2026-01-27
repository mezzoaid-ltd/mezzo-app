"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { SearchInput } from "./search-input";
import { SafeProfile } from "@/types";
import { UserMenu } from "./user-menu"; // We'll create this

interface NavbarRoutesProps {
  currentProfile?: SafeProfile | null;
}

export const NavbarRoutes: React.FC<NavbarRoutesProps> = ({
  currentProfile,
}) => {
  const pathname = usePathname();
  const isTeacherPage = pathname?.startsWith("/teacher");
  const isPlayerPage = pathname?.includes("/chapters");
  const isSearchPage = pathname === "/search";
  const isTeacher =
    currentProfile?.role === "ADMIN" || currentProfile?.role === "TEACHER";

  return (
    <>
      {isSearchPage && (
        <div className="hidden md:block">
          <SearchInput />
        </div>
      )}
      <div className="flex gap-x-2 ml-auto">
        {isTeacherPage || isPlayerPage ? (
          <Link href="/" legacyBehavior>
            <Button size="sm" variant="ghost">
              <LogOut className="h-4 w-4 mr-2" />
              Exit
            </Button>
          </Link>
        ) : isTeacher ? (
          <Link href="/teacher/courses" legacyBehavior>
            <Button size="sm" variant="ghost">
              Teacher Mode
            </Button>
          </Link>
        ) : null}

        <UserMenu currentProfile={currentProfile} />
      </div>
    </>
  );
};

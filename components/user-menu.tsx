"use client";

import { SafeProfile } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface UserMenuProps {
  currentProfile?: SafeProfile | null;
}

export const UserMenu = ({ currentProfile }: UserMenuProps) => {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  if (!currentProfile) {
    return null;
  }

  const initials = currentProfile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={currentProfile.image_url || undefined}
              alt={currentProfile.name}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {currentProfile.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentProfile.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/settings")}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

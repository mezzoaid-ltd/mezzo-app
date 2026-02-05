// =============================================================================
// USER PROFILE EDIT PAGE WITH SEO
// Replace: app/(dashboard)/(routes)/teacher/users/[id]/page.tsx
// =============================================================================

import { Metadata } from "next";
import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MemberRoleForm } from "./_components/member-role-form";
import { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileIdPageProps {
  params: {
    id: string;
  };
}

// =============================================================================
// STATIC METADATA (Private admin page - noindex)
// =============================================================================
export const metadata: Metadata = {
  title: "Edit User",
  description: "Edit user profile and role settings.",
  robots: {
    index: false, // Private admin page
    follow: false,
  },
};

// =============================================================================
// PAGE COMPONENT
// =============================================================================
const ProfileIdPage: React.FC<ProfileIdPageProps> = async ({ params }) => {
  const { id } = params;
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return redirect("/sign-in");
  }

  // Get the profile to edit
  const { data: profileData, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !profileData) {
    return redirect("/teacher/users");
  }

  // Type assertion
  const profile = profileData as Profile;

  return (
    <div className="flex-1 p-6">
      <MemberRoleForm initialData={profile} id={profile.id} />
    </div>
  );
};

export default ProfileIdPage;

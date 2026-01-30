import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { Database } from "@/lib/supabase/types";

// Type from database - now includes all fields
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type Profile = ProfileRow;

// SafeProfile type with all fields
export type SafeProfile = {
  id: string;
  user_id: string;
  name: string;
  image_url: string | null;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  bio: string | null;
  title: string | null;
  headline: string | null;
  website_url: string | null;
  social_links: any;
  created_at: string;
  updated_at: string;
};

/**
 * Get the current user's profile as SafeProfile
 * This replaces Clerk's currentUser() function
 * Cached to avoid multiple database calls in a single request
 */
export const getCurrentProfile = cache(
  async (): Promise<SafeProfile | null> => {
    try {
      const supabase = await createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return null;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError || !profileData) {
        console.error("[getCurrentProfile] error:", profileError);
        return null;
      }

      // Type assertion for the profile data
      const profile = profileData as ProfileRow;

      // Convert to SafeProfile format - now includes all new fields
      const safeProfile: SafeProfile = {
        id: profile.id,
        user_id: profile.user_id,
        name: profile.name,
        image_url: profile.image_url,
        email: profile.email,
        role: profile.role,
        bio: profile.bio,
        title: profile.title,
        headline: profile.headline,
        website_url: profile.website_url,
        social_links: profile.social_links,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };

      return safeProfile;
    } catch (error) {
      console.error("[getCurrentProfile] exception:", error);
      return null;
    }
  },
);

/**
 * Check if current user is a teacher or admin
 */
export const isTeacher = async (): Promise<boolean> => {
  const profile = await getCurrentProfile();
  return profile?.role === "TEACHER" || profile?.role === "ADMIN";
};

/**
 * Check if current user is an admin
 */
export const isAdmin = async (): Promise<boolean> => {
  const profile = await getCurrentProfile();
  return profile?.role === "ADMIN";
};

/**
 * Get current user ID (replaces Clerk's auth().userId)
 */
export const getCurrentUserId = cache(async (): Promise<string | null> => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch (error) {
    console.error("[getCurrentUserId] error:", error);
    return null;
  }
});

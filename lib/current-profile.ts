// import { createClient } from "@/lib/supabase/server";
// import { cache } from "react";

// export type Profile = {
//   id: string;
//   user_id: string;
//   name: string;
//   image_url: string | null;
//   email: string;
//   role: "ADMIN" | "TEACHER" | "STUDENT";
//   created_at: string;
//   updated_at: string;
// };

// /**
//  * Get the current user's profile
//  * This replaces Clerk's currentUser() function
//  * Cached to avoid multiple database calls in a single request
//  */
// export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
//   try {
//     const supabase = await createClient();

//     const {
//       data: { user },
//       error: authError,
//     } = await supabase.auth.getUser();

//     if (authError || !user) {
//       return null;
//     }

//     const { data: profile, error: profileError } = await supabase
//       .from("profiles")
//       .select("*")
//       .eq("user_id", user.id)
//       .single();

//     if (profileError) {
//       console.error("[getCurrentProfile] error:", profileError);
//       return null;
//     }

//     return profile;
//   } catch (error) {
//     console.error("[getCurrentProfile] exception:", error);
//     return null;
//   }
// });

// /**
//  * Check if current user is a teacher or admin
//  */
// export const isTeacher = async (): Promise<boolean> => {
//   const profile = await getCurrentProfile();
//   return profile?.role === "TEACHER" || profile?.role === "ADMIN";
// };

// /**
//  * Check if current user is an admin
//  */
// export const isAdmin = async (): Promise<boolean> => {
//   const profile = await getCurrentProfile();
//   return profile?.role === "ADMIN";
// };

// /**
//  * Get current user ID (replaces Clerk's auth().userId)
//  */
// export const getCurrentUserId = cache(async (): Promise<string | null> => {
//   try {
//     const supabase = await createClient();
//     const {
//       data: { user },
//     } = await supabase.auth.getUser();
//     return user?.id ?? null;
//   } catch (error) {
//     console.error("[getCurrentUserId] error:", error);
//     return null;
//   }
// });

import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { SafeProfile } from "@/types";
import { Database } from "@/lib/supabase/types";

// Type from database
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type Profile = {
  id: string;
  user_id: string;
  name: string;
  image_url: string | null;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
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

      // Convert to SafeProfile format
      const safeProfile: SafeProfile = {
        id: profile.id,
        user_id: profile.user_id,
        name: profile.name,
        image_url: profile.image_url,
        email: profile.email,
        role: profile.role,
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

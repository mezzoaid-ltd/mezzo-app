import { Database } from "@/lib/supabase/types";

// Extract types from Supabase generated types
type Course = Database["public"]["Tables"]["courses"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

export type CourseWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress?: number | null;
  instructor?: {
    id: string;
    name: string;
    title: string | null;
    image_url: string | null;
  } | null;
};

// Use Profile from current-profile
// export type { Profile as SafeProfile } from "@/lib/current-profile";
export type { SafeProfile, Profile } from "@/lib/current-profile";

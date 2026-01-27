// import { Database } from "@/lib/supabase/types";

// // Extract types from Supabase generated types
// type Course = Database["public"]["Tables"]["courses"]["Row"];
// type Category = Database["public"]["Tables"]["categories"]["Row"];
// type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

// export type CourseWithProgressWithCategory = Course & {
//   category: Category | null;
//   chapters: { id: string }[];
//   progress: number | null;
// };

// // Profile type (direct from Supabase)
// export type Profile = ProfileRow;

// export type SafeProfile = Omit<
//   Database["public"]["Tables"]["profiles"]["Row"],
//   "created_at" | "updated_at"
// > & {
//   createdAt: string;
//   updatedAt: string;
// };

import { Database } from "@/lib/supabase/types";

// Extract types from Supabase generated types
type Course = Database["public"]["Tables"]["courses"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

export type CourseWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress?: number | null; // Changed to optional (allows undefined)
};

// Use Profile from current-profile
export type { Profile as SafeProfile } from "@/lib/current-profile";

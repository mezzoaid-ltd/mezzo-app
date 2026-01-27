import { Database } from "@/lib/supabase/types";

// Export all common types for easy import
export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Chapter = Database["public"]["Tables"]["chapters"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Attachment = Database["public"]["Tables"]["attachments"]["Row"];
export type MuxData = Database["public"]["Tables"]["mux_data"]["Row"];
export type UserProgress = Database["public"]["Tables"]["user_progress"]["Row"];
export type Purchase = Database["public"]["Tables"]["purchases"]["Row"];

// Composite types
export type ChapterWithMuxData = Chapter & {
  muxData?: MuxData | null;
};

export type CourseWithCategory = Course & {
  category: Category | null;
};

export type ChapterWithProgress = Chapter & {
  userProgress?: UserProgress[] | null;
};

// Member roles
export type MemberRole = "ADMIN" | "TEACHER" | "STUDENT";

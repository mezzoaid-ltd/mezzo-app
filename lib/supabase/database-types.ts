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
export type StripeCustomer =
  Database["public"]["Tables"]["stripe_customers"]["Row"];

// Instructor minimal info (for course cards)
export type InstructorInfo = Pick<Profile, "id" | "name" | "image_url"> & {
  title: string | null;
};

// Views
export type InstructorStats =
  Database["public"]["Views"]["instructor_stats"]["Row"];

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

export type CourseWithInstructor = Course & {
  instructor: InstructorInfo | null;
  chapters: { id: string }[];
  progress?: number | null;
};

export type CourseWithCategoryAndInstructor = Course & {
  category: Category | null;
  instructor: InstructorInfo | null;
  chapters: { id: string }[];
  progress?: number | null;
};

// Member roles
export type MemberRole = "ADMIN" | "TEACHER" | "STUDENT";

// Helper type for social links
export type SocialLinks = {
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
};

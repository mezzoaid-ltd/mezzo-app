export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MemberRole = "ADMIN" | "TEACHER" | "STUDENT";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          image_url: string | null;
          email: string;
          role: MemberRole;
          bio: string | null;
          title: string | null;
          headline: string | null;
          website_url: string | null;
          social_links: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          image_url?: string | null;
          email: string;
          role?: MemberRole;
          bio?: string | null;
          title?: string | null;
          headline?: string | null;
          website_url?: string | null;
          social_links?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          image_url?: string | null;
          email?: string;
          role?: MemberRole;
          bio?: string | null;
          title?: string | null;
          headline?: string | null;
          website_url?: string | null;
          social_links?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          image_url: string | null;
          price: number | null;
          is_published: boolean;
          category_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          image_url?: string | null;
          price?: number | null;
          is_published?: boolean;
          category_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          image_url?: string | null;
          price?: number | null;
          is_published?: boolean;
          category_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      attachments: {
        Row: {
          id: string;
          name: string;
          url: string;
          course_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          url: string;
          course_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          url?: string;
          course_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      chapters: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          video_url: string | null;
          position: number;
          is_published: boolean;
          is_free: boolean;
          course_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          video_url?: string | null;
          position: number;
          is_published?: boolean;
          is_free?: boolean;
          course_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          video_url?: string | null;
          position?: number;
          is_published?: boolean;
          is_free?: boolean;
          course_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      mux_data: {
        Row: {
          id: string;
          asset_id: string;
          playback_id: string | null;
          chapter_id: string;
        };
        Insert: {
          id?: string;
          asset_id: string;
          playback_id?: string | null;
          chapter_id: string;
        };
        Update: {
          id?: string;
          asset_id?: string;
          playback_id?: string | null;
          chapter_id?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          chapter_id: string;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          chapter_id: string;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          chapter_id?: string;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchases: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      stripe_customers: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      logging: {
        Row: {
          id: string;
          url: string;
          method: string;
          body: string | null;
          response: string | null;
          status_code: number | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          method: string;
          body?: string | null;
          response?: string | null;
          status_code?: number | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          url?: string;
          method?: string;
          body?: string | null;
          response?: string | null;
          status_code?: number | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      instructor_stats: {
        Row: {
          instructor_id: string;
          name: string;
          email: string;
          image_url: string | null;
          bio: string | null;
          title: string | null;
          headline: string | null;
          total_courses: number;
          total_students: number;
          average_price: number;
          last_course_date: string | null;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      member_role: MemberRole;
    };
  };
}

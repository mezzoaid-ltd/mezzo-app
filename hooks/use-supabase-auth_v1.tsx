"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

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

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Fetch profile data
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("[fetchProfile] error:", error);
        return null;
      }

      return data as Profile;
    } catch (err) {
      console.error("[fetchProfile] exception:", err);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const profileData = await fetchProfile(currentSession.user.id);
          setProfile(profileData);
        }
      } catch (err) {
        console.error("[useSupabaseAuth] init error:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("[useSupabaseAuth] Auth event:", event);

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const profileData = await fetchProfile(currentSession.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }

      // Handle redirects
      if (event === "SIGNED_IN") {
        router.refresh();
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
        router.push("/sign-in");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, router]);

  // Sign in with Google
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("[useSupabaseAuth] Google sign-in error:", error);
    }

    return { data, error };
  };

  // Sign in with GitHub
  const signInWithGithub = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("[useSupabaseAuth] GitHub sign-in error:", error);
    }

    return { data, error };
  };

  // Sign in with email/password
  const signInWithPassword = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[useSupabaseAuth] Sign in error:", error);
    }

    return { data, error };
  };

  // Sign up with email/password
  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("[useSupabaseAuth] Sign up error:", error);
    }

    return { data, error };
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("[useSupabaseAuth] Sign out error:", error);
    }

    return { error };
  };

  // Reset password
  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      console.error("[useSupabaseAuth] Reset password error:", error);
    }

    return { data, error };
  };

  // Update password
  const updatePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("[useSupabaseAuth] Update password error:", error);
    }

    return { data, error };
  };

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) {
      return { data: null, error: new Error("No user ID") };
    }

    const { data, error } = await (supabase.from("profiles") as any)
      .update(updates)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[useSupabaseAuth] Update profile error:", error);
    } else {
      setProfile(data as Profile);
    }

    return { data, error };
  };

  // Check if user is teacher or admin
  const isTeacher = profile?.role === "TEACHER" || profile?.role === "ADMIN";
  const isAdmin = profile?.role === "ADMIN";

  return {
    user,
    session,
    profile,
    loading,
    isTeacher,
    isAdmin,
    signInWithGoogle,
    signInWithGithub,
    signInWithPassword,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  };
}

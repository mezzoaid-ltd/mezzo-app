import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();

    // ✅ Exchange code for session with error handling
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[AUTH_CALLBACK] Error exchanging code:", error);
      // Redirect to sign-in with error
      return NextResponse.redirect(
        new URL("/sign-in?error=auth_failed", requestUrl.origin),
      );
    }

    // ✅ Send welcome email for new OAuth users
    try {
      // Get the authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if this is a new user (profile created recently)
        const { data: profileRaw } = await supabase
          .from("profiles")
          .select("created_at")
          .eq("user_id", user.id)
          .single();

        // ✅ FIX: Explicit type casting for TypeScript
        const profile = profileRaw as { created_at: string } | null;

        if (profile) {
          const createdAt = new Date(profile.created_at).getTime();
          const now = Date.now();
          const isNewUser = now - createdAt < 10000; // Profile created in last 10 seconds

          if (isNewUser) {
            // Send welcome email (fire and forget)
            const API_BASE_URL =
              process.env.NEXT_PUBLIC_BACKEND_URL ||
              "https://mezzo-app-service.onrender.com";

            fetch(`${API_BASE_URL}/api/v1/emails/lms/welcome`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                userName:
                  user.user_metadata?.full_name ||
                  user.email?.split("@")[0] ||
                  "there",
              }),
            }).catch((err) =>
              console.error("[OAUTH_WELCOME_EMAIL] Failed:", err),
            );
          }
        }
      }
    } catch (emailError) {
      console.error("[OAUTH_WELCOME_EMAIL] Error:", emailError);
      // Don't block OAuth flow if email fails
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

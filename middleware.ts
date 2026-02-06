import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that don't require authentication
const publicRoutes = [
  "/sign-in",
  "/sign-up",
  "/auth/callback", // ✅ Allow auth callback
  "/api/webhook",
  "/api/uploadthing",
];

// Routes that require teacher/admin role
const teacherRoutes = ["/teacher"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    },
  );

  // ✅ ADD: Handle refresh token errors gracefully
  try {
    // Get user session
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // ✅ If refresh token is invalid, clear cookies and redirect to sign-in
    if (
      error?.message?.includes("refresh_token_not_found") ||
      error?.message?.includes("Invalid Refresh Token")
    ) {
      const signInUrl = new URL("/sign-in", request.url);
      const redirectResponse = NextResponse.redirect(signInUrl);

      // Clear all auth cookies
      redirectResponse.cookies.delete("sb-access-token");
      redirectResponse.cookies.delete("sb-refresh-token");

      return redirectResponse;
    }

    // Redirect to sign-in if not authenticated
    if (!user) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check teacher routes
    if (teacherRoutes.some((route) => pathname.startsWith(route))) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (
        !profile ||
        (profile.role !== "TEACHER" && profile.role !== "ADMIN")
      ) {
        // Redirect non-teachers away from teacher routes
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    return response;
  } catch (err) {
    // ✅ Catch any unexpected auth errors
    console.error("[MIDDLEWARE] Auth error:", err);

    // Clear cookies and redirect to sign-in
    const signInUrl = new URL("/sign-in", request.url);
    const redirectResponse = NextResponse.redirect(signInUrl);
    redirectResponse.cookies.delete("sb-access-token");
    redirectResponse.cookies.delete("sb-refresh-token");

    return redirectResponse;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

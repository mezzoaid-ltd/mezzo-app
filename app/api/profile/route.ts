import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const values = await req.json();

    const { data, error } = await supabase
      .from("profiles")
      // Update profile - TypeScript has inference issues with Supabase's generic types
      // @ts-expect-error - Supabase type inference limitation with .update()
      .update({
        name: values.name,
        image_url: values.image_url,
        bio: values.bio,
        title: values.title,
        headline: values.headline,
        website_url: values.website_url,
        social_links: values.social_links,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[PROFILE_PATCH]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.log("[PROFILE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

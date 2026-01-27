import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { ...values } = await req.json();

    // Check if current user is admin or updating their own profile
    const { data: ownProfileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const ownProfile = ownProfileData as Pick<Profile, "role"> | null;

    if (!ownProfile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only admins can update other profiles
    const { data: targetProfileData } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("id", params.id)
      .single();

    const targetProfile = targetProfileData as Pick<Profile, "user_id"> | null;

    if (targetProfile?.user_id !== user.id && ownProfile.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { data: profile, error } = await (supabase.from("profiles") as any)
      .update(values)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      console.error("[PROFILE_ID]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.log("[PROFILE_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

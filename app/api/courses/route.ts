import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title } = await req.json();

    const { data: course, error } = await (supabase.from("courses") as any)
      .insert({
        user_id: user.id,
        title,
      })
      .select()
      .single();

    if (error) {
      console.error("[COURSES]", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSES]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

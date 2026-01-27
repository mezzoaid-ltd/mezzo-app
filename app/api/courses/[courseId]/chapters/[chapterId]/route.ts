import Mux from "@mux/mux-node";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Database } from "@/lib/supabase/types";

type Chapter = Database["public"]["Tables"]["chapters"]["Row"];
type MuxData = Database["public"]["Tables"]["mux_data"]["Row"];

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } },
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user owns the course
    const { data: ownCourse } = await supabase
      .from("courses")
      .select("id")
      .eq("id", params.courseId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get chapter
    const { data: chapterData } = await supabase
      .from("chapters")
      .select("*")
      .eq("id", params.chapterId)
      .eq("course_id", params.courseId)
      .maybeSingle();

    if (!chapterData) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const chapter = chapterData as Chapter;

    // If chapter has video, delete from Mux
    if (chapter.video_url) {
      const { data: existingMuxDataResult } = await supabase
        .from("mux_data")
        .select("*")
        .eq("chapter_id", params.chapterId)
        .maybeSingle();

      const existingMuxData = existingMuxDataResult as MuxData | null;

      if (existingMuxData) {
        try {
          await mux.video.assets.delete(existingMuxData.asset_id);
        } catch (error) {
          console.error("[MUX_DELETE]", error);
        }

        await supabase.from("mux_data").delete().eq("id", existingMuxData.id);
      }
    }

    // Delete chapter
    const { data: deletedChapter, error } = await supabase
      .from("chapters")
      .delete()
      .eq("id", params.chapterId)
      .select()
      .single();

    if (error) {
      console.error("[CHAPTER_ID_DELETE]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }

    // Check if course has any published chapters left
    const { data: publishedChapters } = await supabase
      .from("chapters")
      .select("id")
      .eq("course_id", params.courseId)
      .eq("is_published", true);

    if (!publishedChapters || publishedChapters.length === 0) {
      await (supabase.from("courses") as any)
        .update({ is_published: false })
        .eq("id", params.courseId);
    }

    return NextResponse.json(deletedChapter);
  } catch (error) {
    console.log("[CHAPTER_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } },
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { isPublished, ...values } = await req.json();

    // Check if user owns the course
    const { data: ownCourse } = await supabase
      .from("courses")
      .select("id")
      .eq("id", params.courseId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update chapter
    const { data: chapter, error } = await (supabase.from("chapters") as any)
      .update(values)
      .eq("id", params.chapterId)
      .eq("course_id", params.courseId)
      .select()
      .single();

    if (error) {
      console.error("[COURSES_CHAPTER_ID]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }

    // Handle video upload to Mux
    if (values.video_url) {
      const { data: existingMuxDataResult } = await supabase
        .from("mux_data")
        .select("*")
        .eq("chapter_id", params.chapterId)
        .maybeSingle();

      const existingMuxData = existingMuxDataResult as MuxData | null;

      if (existingMuxData) {
        try {
          await mux.video.assets.delete(existingMuxData.asset_id);
        } catch (error) {
          console.log("[Mux Asset Delete]", error);
        }
        await supabase.from("mux_data").delete().eq("id", existingMuxData.id);
      }

      try {
        const asset = await mux.video.assets.create({
          input: [{ url: values.video_url }],
          playback_policy: ["public"],
          test: false,
        });

        if (asset) {
          await (supabase.from("mux_data") as any).insert({
            chapter_id: params.chapterId,
            asset_id: asset.id,
            playback_id: asset.playback_ids?.[0]?.id,
          });
        }
      } catch (error) {
        console.log("[Mux Asset Create]", error);
      }
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[COURSES_CHAPTER_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

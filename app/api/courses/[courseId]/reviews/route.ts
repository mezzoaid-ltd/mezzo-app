import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET - Fetch all reviews for a course
export async function GET(
  req: Request,
  { params }: { params: { courseId: string } },
) {
  try {
    const supabase = await createClient();

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        user:profiles!reviews_user_id_fkey(
          id,
          user_id,
          name,
          image_url
        )
      `,
      )
      .eq("course_id", params.courseId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[REVIEWS_GET]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(reviews || []);
  } catch (error) {
    console.log("[REVIEWS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST - Create a new review
export async function POST(
  req: Request,
  { params }: { params: { courseId: string } },
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { rating, comment } = await req.json();

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return new NextResponse("Invalid rating", { status: 400 });
    }

    // Check if user purchased the course
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", params.courseId)
      .maybeSingle();

    if (!purchase) {
      return new NextResponse("You must purchase this course to review it", {
        status: 403,
      });
    }

    // Check if user already reviewed
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", params.courseId)
      .maybeSingle();

    if (existingReview) {
      return new NextResponse("You have already reviewed this course", {
        status: 400,
      });
    }

    // Create review
    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        course_id: params.courseId,
        rating,
        comment: comment || null,
      } as any)
      .select()
      .single();

    if (error) {
      console.error("[REVIEW_POST]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.log("[REVIEW_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH - Update existing review
export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } },
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { rating, comment } = await req.json();

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return new NextResponse("Invalid rating", { status: 400 });
    }

    // Update review
    const { data: review, error } = await supabase
      .from("reviews")
      // @ts-expect-error - Supabase type inference limitation with .update()
      .update({
        rating,
        comment: comment || null,
      } as any)
      .eq("user_id", user.id)
      .eq("course_id", params.courseId)
      .select()
      .single();

    if (error) {
      console.error("[REVIEW_PATCH]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.log("[REVIEW_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE - Delete review
export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } },
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("user_id", user.id)
      .eq("course_id", params.courseId);

    if (error) {
      console.error("[REVIEW_DELETE]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log("[REVIEW_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

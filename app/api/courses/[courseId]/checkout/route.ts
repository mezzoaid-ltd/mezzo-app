import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { Database } from "@/lib/supabase/types";

type Course = Database["public"]["Tables"]["courses"]["Row"];
type StripeCustomer = Database["public"]["Tables"]["stripe_customers"]["Row"];

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } },
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get course
    const { data: courseData } = await supabase
      .from("courses")
      .select("*")
      .eq("id", params.courseId)
      .eq("is_published", true)
      .maybeSingle();

    const course = courseData as Course | null;

    // Check if already purchased
    const { data: purchase } = await supabase
      .from("purchases")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", params.courseId)
      .maybeSingle();

    if (purchase) {
      return new NextResponse("Already Purchased", { status: 400 });
    }

    if (!course) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Define line items for stripe checkout page
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: course.title,
          },
          unit_amount: Math.round(course.price! * 100),
        },
        quantity: 1,
      },
    ];

    // Get or create stripe customer
    let { data: stripeCustomerData } = await supabase
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let stripeCustomer = stripeCustomerData as Pick<
      StripeCustomer,
      "stripe_customer_id"
    > | null;

    if (!stripeCustomer) {
      const customer = await stripe.customers.create({
        email: user.email,
      });

      const { data: newCustomerData } = await (
        supabase.from("stripe_customers") as any
      )
        .insert({
          user_id: user.id,
          stripe_customer_id: customer.id,
        })
        .select()
        .single();

      stripeCustomer = newCustomerData as Pick<
        StripeCustomer,
        "stripe_customer_id"
      >;
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer!.stripe_customer_id,
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?canceled=1`,
      metadata: {
        courseId: course.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.log("COURSE_ID_CHECKOUT", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

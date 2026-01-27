import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createLogging, Logging } from "@/lib/logging";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error: any) {
    const logging: Logging = {
      url: req.url,
      method: req.method,
      body: body,
      status_code: 400,
      error_message: error.message,
      created_at: new Date(),
    };

    await createLogging(logging);

    return new NextResponse(`Webhook Error: ${error.message}`, {
      status: 400,
    });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session?.metadata?.userId;
  const courseId = session?.metadata?.courseId;

  if (event.type === "checkout.session.completed") {
    if (!userId || !courseId) {
      const logging: Logging = {
        url: req.url,
        method: req.method,
        body: body,
        status_code: 400,
        error_message: "Missing metadata",
        created_at: new Date(),
      };

      await createLogging(logging);

      return new NextResponse(`Webhook Error: Missing metadata`, {
        status: 400,
      });
    }

    const supabase = await createClient();

    // Create purchase record with type assertion
    await (supabase.from("purchases") as any).insert({
      course_id: courseId,
      user_id: userId,
    });
  } else {
    const logging: Logging = {
      url: req.url,
      method: req.method,
      body: body,
      status_code: 200,
      created_at: new Date(),
    };

    await createLogging(logging);

    return new NextResponse(
      `Webhook Error: Unhandled event type ${event.type}`,
      { status: 200 },
    );
  }

  const logging: Logging = {
    url: req.url,
    method: req.method,
    body: body,
    status_code: 200,
    created_at: new Date(),
  };

  await createLogging(logging);

  return new NextResponse(null, { status: 200 });
}

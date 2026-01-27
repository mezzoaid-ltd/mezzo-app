import { createClient } from "@/lib/supabase/server";

export interface Logging {
  id?: string;
  url: string;
  method: string;
  body?: string;
  response?: string;
  status_code?: number;
  error_message?: string;
  created_at?: Date;
}

export async function createLogging(logging: Logging): Promise<void> {
  try {
    const supabase = await createClient();

    // Use 'as any' to bypass type checking
    const { error } = await (supabase.from("logging") as any).insert({
      url: logging.url,
      method: logging.method,
      body: logging.body,
      response: logging.response,
      status_code: logging.status_code,
      error_message: logging.error_message,
    });

    if (error) {
      console.error("[CREATE_LOGGING] Insert error:", error);
    }
  } catch (error) {
    console.error("[CREATE_LOGGING]", error);
  }
}

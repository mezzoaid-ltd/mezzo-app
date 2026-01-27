// import { createClient as createSupabaseClient } from "@supabase/supabase-js";
// import type { Database } from "./types";

// // Export a function that creates a new client instance
// export function createClient() {
//   return createSupabaseClient<Database>(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       auth: {
//         autoRefreshToken: true,
//         persistSession: true,
//         detectSessionInUrl: true,
//       },
//     },
//   );
// }

// // Singleton instance for direct use
// export const supabase = createClient();

// // Helper to check if we're in browser
// export const isBrowser = typeof window !== "undefined";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

// Singleton pattern to prevent multiple instances
let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (client) {
    return client;
  }

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  return client;
}

// Export singleton instance for direct use
export const supabase = createClient();

"use strict";

/**
 * Supabase client singleton for the dashboard frontend.
 * Uses REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY from environment.
 * This client is read-only for this task; no DB mutation helpers are provided.
 */

import { createClient } from "@supabase/supabase-js";

// Validate required environment variables at module load time.
// Note: In CRA, env vars must be prefixed with REACT_APP_ to be exposed to the client.
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Provide a helpful console error while avoiding application crash.
  // The dashboard will not function without these variables set.
  // Make sure to configure them in your .env file at the project root:
  // REACT_APP_SUPABASE_URL=...
  // REACT_APP_SUPABASE_KEY=...
  // See assets/dashboard_build_plan_supabase.md for more details.
  // eslint-disable-next-line no-console
  console.error(
    "[Supabase] Missing environment variables. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in your .env file."
  );
}

/**
 * Create a Supabase client with minimal options.
 * - auth: persistSession true for keeping session across reloads (if Auth is used later)
 * - realtime enabled by default; consumers may create channels as needed
 */
export const supabase = createClient(SUPABASE_URL || "", SUPABASE_ANON_KEY || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 5, // small throttle to avoid excessive UI updates
    },
  },
});

/**
 * Utility to create a unified realtime channel with multiple DB change subscriptions.
 * Callers should store the returned channel and remove it on unmount.
 *
 * Example:
 * const channel = createDbChangesChannel([
 *   { event: 'INSERT', table: 'sales', handler: handleSaleInsert },
 *   { event: 'UPDATE', table: 'projects', handler: handleProjectUpdate },
 * ]);
 * return () => supabase.removeChannel(channel);
 */
// PUBLIC_INTERFACE
export function createDbChangesChannel(subscriptions, channelName = "db-changes") {
  /** Create and return a realtime channel with the provided subscriptions. */
  const channel = supabase.channel(channelName);
  subscriptions.forEach((sub) => {
    const { event = "*", table, schema = "public", filter, handler } = sub || {};
    if (!table || typeof handler !== "function") return;
    channel.on(
      "postgres_changes",
      { event, schema, table, filter },
      (payload) => {
        try {
          handler(payload);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(`[Supabase Realtime] Handler error for ${table}.${event}`, err);
        }
      }
    );
  });

  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      // eslint-disable-next-line no-console
      console.info("[Supabase Realtime] Subscribed to channel:", channelName);
    }
  });

  return channel;
}

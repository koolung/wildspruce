import { createClient } from "@supabase/supabase-js";

// Supabase client for server-side operations
// IMPORTANT: Service role key is NEVER exposed to client-side code
// This file is server-only and should only be imported in Server Actions or API Routes

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
  );
}

// This client uses the service role key for full database access
// Use this ONLY for server-side operations (Server Actions, API Routes)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false, // Don't persist sessions for server-side client
  },
});

// Type definitions for database tables
export interface Booking {
  id: string;
  name: string;
  email: string;
  phone?: string;
  start_date: string; // ISO date string (UTC)
  end_date: string; // ISO date string (UTC)
  guests: number;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface BlockedDate {
  id: string;
  date_start: string; // ISO date string (UTC)
  date_end: string; // ISO date string (UTC)
  reason?: string;
  created_at: string;
  updated_at: string;
}

// Helper function to check if dates overlap
export function datesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  // Dates don't overlap if one ends before or on the same day the other starts
  // Using exclusive end dates: checkout date is available for next guest
  return start1 < end2 && end1 > start2;
}

// Helper to normalize date to UTC ISO string (YYYY-MM-DD format)
export function normalizeToUTC(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  // Return the UTC date in YYYY-MM-DD format
  const utcDate = new Date(d.toLocaleString("en-US", { timeZone: "UTC" }));
  return utcDate.toISOString().split("T")[0];
}

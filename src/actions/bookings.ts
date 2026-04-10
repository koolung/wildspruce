"use server";

import { createBookingSchema, updateBookingStatusSchema, blockDateSchema, getAvailabilitySchema } from "@/lib/validation";
import { supabase, datesOverlap, type Booking, type BlockedDate } from "@/lib/supabase";
import { sendBookingConfirmationEmail, sendBookingNotificationToAdmin, sendStatusUpdateEmail } from "@/lib/email";

// Helper to parse dates from database that might be YYYY-MM-DD or ISO timestamps
function parseDBDate(dateInput: string | null | undefined): Date {
  if (!dateInput) throw new Error("Invalid date input");
  let dateStr = String(dateInput).trim();
  // Extract just YYYY-MM-DD part if it's an ISO timestamp with T
  if (dateStr.includes("T")) {
    dateStr = dateStr.split("T")[0];
  }
  const parts = dateStr.split("-");
  if (parts.length !== 3) throw new Error(`Invalid date format: ${dateStr}`);
  const [year, month, day] = parts.map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error(`Invalid date components: year=${year}, month=${month}, day=${day}`);
  }
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * CREATE BOOKING SERVER ACTION
 * 
 * 1. Validates input with Zod
 * 2. Checks for overlapping bookings and blocked dates
 * 3. Creates new booking with pending status
 * 4. Sends confirmation emails to guest and admin
 * 5. Implements rate limiting by email
 */
export async function createBooking(input: unknown) {
  try {
    // Validate input
    const validatedInput = createBookingSchema.parse(input);

    // Rate limiting: Check if email has created 3+ bookings in last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setUTCDate(oneDayAgo.getUTCDate() - 1);
    
    const { data: recentBookings, error: recentError } = await supabase
      .from("bookings")
      .select("id")
      .eq("email", validatedInput.email)
      .gte("created_at", oneDayAgo.toISOString())
      .limit(3);

    if (recentError) throw recentError;

    if (recentBookings && recentBookings.length >= 3) {
      return {
        success: false,
        error: "Too many booking requests. Please try again later.",
      };
    }

    // Check for overlapping bookings (not cancelled)
    const { data: existingBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("start_date, end_date, status")
      .neq("status", "cancelled");

    if (bookingsError) throw bookingsError;

    const requestStart = new Date(validatedInput.start_date + "T00:00:00Z");
    const requestEnd = new Date(validatedInput.end_date + "T00:00:00Z");

    if (existingBookings) {
      for (const booking of existingBookings) {
        const existingStart = new Date(booking.start_date + "T00:00:00Z");
        const existingEnd = new Date(booking.end_date + "T00:00:00Z");

        if (datesOverlap(requestStart, requestEnd, existingStart, existingEnd)) {
          return {
            success: false,
            error: "These dates overlap with an existing booking. Please choose different dates.",
          };
        }
      }
    }

    // Check for blocked dates
    const { data: blockedDates, error: blockedError } = await supabase
      .from("blocked_dates")
      .select("date_start, date_end");

    if (blockedError) throw blockedError;

    if (blockedDates) {
      for (const blocked of blockedDates) {
        const blockedStart = parseDBDate(blocked.date_start);
        const blockedEnd = parseDBDate(blocked.date_end);

        if (datesOverlap(requestStart, requestEnd, blockedStart, blockedEnd)) {
          return {
            success: false,
            error: "One or more of these dates are blocked. Please choose different dates.",
          };
        }
      }
    }

    // Create booking
    const { data: newBooking, error: createError } = await supabase
      .from("bookings")
      .insert([
        {
          name: validatedInput.name,
          email: validatedInput.email,
          phone: validatedInput.phone || null,
          start_date: validatedInput.start_date,
          end_date: validatedInput.end_date,
          guests: validatedInput.guests,
          notes: validatedInput.notes || null,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (createError) throw createError;

    // Create blocked_dates entry for the booked range
    const { error: blockedDateError } = await supabase
      .from("blocked_dates")
      .insert([
        {
          date_start: validatedInput.start_date,
          date_end: validatedInput.end_date,
          reason: `Booking by ${validatedInput.name} (${validatedInput.email})`,
        },
      ]);

    if (blockedDateError) {
      console.error("Error creating blocked_dates entry:", blockedDateError);
      // Don't fail the booking if blocked dates creation fails
    }

    // Send emails (fire and forget - don't block response)
    Promise.all([
      sendBookingConfirmationEmail(newBooking as Booking),
      sendBookingNotificationToAdmin(newBooking as Booking),
    ]).catch(err => console.error("Error sending emails:", err));

    return {
      success: true,
      bookingId: newBooking.id,
      message: "Booking submitted successfully. Check your email for confirmation.",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error creating booking:", errorMessage, error);
    if (error instanceof Error && error.message.includes("validation")) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: `Failed to create booking: ${errorMessage}`,
    };
  }
}

/**
 * GET AVAILABILITY SERVER ACTION
 * 
 * Returns list of unavailable dates within a given date range
 * Used by frontend calendar to show blocked dates
 */
/**
 * GET AVAILABILITY SERVER ACTION
 * Returns list of unavailable dates (from bookings and blocked_dates)
 */
export async function getAvailability(input: unknown) {
  try {
    const validatedInput = getAvailabilitySchema.parse(input);
    const startDate = new Date(validatedInput.start_date + "T00:00:00Z");
    const endDate = new Date(validatedInput.end_date + "T00:00:00Z");

    // Get all confirmed and pending bookings in date range
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("start_date, end_date")
      .neq("status", "cancelled");

    if (bookingsError) throw bookingsError;

    // Get all blocked dates in date range
    const { data: blockedDates, error: blockedError } = await supabase
      .from("blocked_dates")
      .select("date_start, date_end");

    if (blockedError) throw blockedError;

    // Compile unavailable dates
    const unavailableDates: string[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];

      // Check against bookings
      let isUnavailable = false;
      if (bookings) {
        for (const booking of bookings) {
          const bookStart = parseDBDate(booking.start_date);
          const bookEnd = parseDBDate(booking.end_date);
          if (currentDate >= bookStart && currentDate < bookEnd) {
            isUnavailable = true;
            break;
          }
        }
      }

      // Check against blocked dates
      if (!isUnavailable && blockedDates) {
        for (const blocked of blockedDates) {
          const blockStart = parseDBDate(blocked.date_start);
          const blockEnd = parseDBDate(blocked.date_end);
          if (currentDate >= blockStart && currentDate < blockEnd) {
            isUnavailable = true;
            break;
          }
        }
      }

      if (isUnavailable) {
        unavailableDates.push(dateStr);
      }

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return {
      success: true,
      unavailableDates,
    };
  } catch (error) {
    console.error("Error getting availability:", error);
    return {
      success: false,
      error: "Failed to fetch availability. Please try again.",
    };
  }
}

/**
 * ADMIN UPDATE BOOKING STATUS SERVER ACTION
 * 
 * Only callable with valid admin credentials (verified by middleware)
 * Updates booking status and sends email notification to guest
 */
export async function adminUpdateBooking(input: unknown) {
  try {
    const validatedInput = updateBookingStatusSchema.parse(input);

    // Update booking status only
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({ status: validatedInput.status })
      .eq("id", validatedInput.bookingId)
      .select()
      .single();

    if (updateError) throw updateError;
    if (!updatedBooking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    // Send status update email
    sendStatusUpdateEmail(updatedBooking as Booking).catch(err =>
      console.error("Error sending status update email:", err)
    );

    return {
      success: true,
      message: `Booking status updated to ${validatedInput.status}. Guest notified via email.`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error updating booking:", errorMessage, error);
    return {
      success: false,
      error: `Failed to update booking: ${errorMessage}`,
    };
  }
}

/**
 * BLOCK DATES SERVER ACTION
 * 
 * Only callable with valid admin credentials (verified by middleware)
 * Blocks a date range from new bookings
 */
export async function blockDate(input: unknown) {
  try {
    const validatedInput = blockDateSchema.parse(input);

    // Insert blocked date
    const { data: blockedDate, error: blockError } = await supabase
      .from("blocked_dates")
      .insert([
        {
          date_start: validatedInput.start_date,
          date_end: validatedInput.end_date,
          reason: validatedInput.reason || null,
        },
      ])
      .select()
      .single();

    if (blockError) throw blockError;

    return {
      success: true,
      message: "Dates blocked successfully",
      blockedDate,
    };
  } catch (error) {
    console.error("Error blocking dates:", error);
    return {
      success: false,
      error: "Failed to block dates. Please try again.",
    };
  }
}

/**
 * GET ALL BOOKINGS SERVER ACTION (ADMIN ONLY)
 * 
 * Returns all bookings, sorted by creation date (newest first)
 */
export async function getAllBookings() {
  try {
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      bookings,
    };
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return {
      success: false,
      error: "Failed to fetch bookings",
      bookings: [],
    };
  }
}

/**
 * GET BLOCKED DATES SERVER ACTION (ADMIN ONLY)
 * 
 * Returns all blocked date ranges
 */
export async function getBlockedDates() {
  try {
    const { data: blockedDates, error } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("date_start", { ascending: true });

    if (error) throw error;

    return {
      success: true,
      blockedDates,
    };
  } catch (error) {
    console.error("Error fetching blocked dates:", error);
    return {
      success: false,
      error: "Failed to fetch blocked dates",
      blockedDates: [],
    };
  }
}

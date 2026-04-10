import { z } from "zod";

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation: allow common formats (7+ digits)
const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;

// Helper to convert date string to YYYY-MM-DD UTC format
const dateToUTCString = (val: string | Date): string => {
  const d = typeof val === "string" ? new Date(val) : val;
  // Parse as UTC and return YYYY-MM-DD
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const createBookingSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters")
    .trim(),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .regex(phoneRegex, "Invalid phone number")
    .max(20, "Phone must be less than 20 characters")
    .trim()
    .optional(),
  start_date: z
    .string(), // Will be YYYY-MM-DD format from frontend
  end_date: z
    .string(), // Will be YYYY-MM-DD format from frontend
  guests: z
    .number()
    .int("Guests must be a whole number")
    .min(1, "At least 1 guest required")
    .max(20, "Maximum 20 guests allowed"),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .nullable(),
})
  .refine(
    (data) => {
      // Parse dates consistently as UTC to avoid timezone issues
      const [startYear, startMonth, startDay] = data.start_date.split("-").map(Number);
      const [endYear, endMonth, endDay] = data.end_date.split("-").map(Number);
      const startDate = new Date(Date.UTC(startYear, startMonth - 1, startDay));
      const endDate = new Date(Date.UTC(endYear, endMonth - 1, endDay));
      return endDate > startDate;
    },
    {
      message: "End date must be after start date",
      path: ["end_date"],
    }
  )
  .refine(
    (data) => {
      const [startYear, startMonth, startDay] = data.start_date.split("-").map(Number);
      const startDate = new Date(Date.UTC(startYear, startMonth - 1, startDay));
      const today = new Date();
      // Get today's date in UTC
      const todayUTC = new Date(Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate(),
        0,
        0,
        0,
        0
      ));
      return startDate >= todayUTC; // Allow today and future dates
    },
    {
      message: "Start date must be today or in the future",
      path: ["start_date"],
    }
  );

export const blockDateSchema = z.object({
  start_date: z
    .string(), // YYYY-MM-DD format
  end_date: z
    .string(), // YYYY-MM-DD format
  reason: z
    .string()
    .max(500, "Reason must be less than 500 characters")
    .optional()
    .nullable(),
}).refine(
  (data) => {
    // Parse dates consistently as UTC to avoid timezone issues
    const [startYear, startMonth, startDay] = data.start_date.split("-").map(Number);
    const [endYear, endMonth, endDay] = data.end_date.split("-").map(Number);
    const startDate = new Date(Date.UTC(startYear, startMonth - 1, startDay));
    const endDate = new Date(Date.UTC(endYear, endMonth - 1, endDay));
    return endDate >= startDate;
  },
  {
    message: "End date must be on or after start date",
    path: ["end_date"],
  }
);

export const updateBookingStatusSchema = z.object({
  bookingId: z
    .string()
    .uuid("Invalid booking ID"),
  status: z
    .enum(["pending", "confirmed", "cancelled"]),
});

export const getAvailabilitySchema = z.object({
  start_date: z
    .string(), // YYYY-MM-DD format
  end_date: z
    .string(), // YYYY-MM-DD format
}).refine(
  (data) => {
    // Parse dates consistently as UTC to avoid timezone issues
    const [startYear, startMonth, startDay] = data.start_date.split("-").map(Number);
    const [endYear, endMonth, endDay] = data.end_date.split("-").map(Number);
    const startDate = new Date(Date.UTC(startYear, startMonth - 1, startDay));
    const endDate = new Date(Date.UTC(endYear, endMonth - 1, endDay));
    return endDate > startDate;
  },
  {
    message: "End date must be after start date",
    path: ["end_date"],
  }
);

// Type exports for use in server actions
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type BlockDateInput = z.infer<typeof blockDateSchema>;
export type UpdateBookingStatusInput = z.infer<
  typeof updateBookingStatusSchema
>;
export type GetAvailabilityInput = z.infer<typeof getAvailabilitySchema>;

import nodemailer from "nodemailer";
import type { Booking } from "./supabase";

// Configure nodemailer transporter with credentials from .env.local
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const fromEmail = process.env.SMTP_FROM_EMAIL || "info@wildspruce.ca";
const adminEmail = process.env.ADMIN_EMAIL || "info@wildspruce.ca";

// Helper function to parse dates from either string (YYYY-MM-DD or ISO format) or Date object
function parseDateToUTC(dateInput: string | Date | null | undefined): Date {
  if (!dateInput) {
    throw new Error("Invalid date input: date is null or undefined");
  }
  
  let dateStr: string;
  
  // If it's already a Date object, convert to ISO string and extract YYYY-MM-DD
  if (dateInput instanceof Date) {
    dateStr = dateInput.toISOString().split("T")[0];
  } else {
    dateStr = String(dateInput).trim();
    // Handle ISO format dates with timezone (e.g., "2026-04-01T00:00:00+00:00" -> "2026-04-01")
    if (dateStr.includes("T")) {
      dateStr = dateStr.split("T")[0];
    }
  }
  
  // Parse YYYY-MM-DD format
  const parts = dateStr.split("-");
  if (parts.length !== 3) {
    throw new Error(`Invalid date format: "${dateStr}"`);
  }
  
  const [year, month, day] = parts.map(Number);
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error(`Invalid date components: year=${year}, month=${month}, day=${day}`);
  }
  
  return new Date(Date.UTC(year, month - 1, day));
}

// Send confirmation email to guest after booking submission
export async function sendBookingConfirmationEmail(booking: Booking) {
  try {
    const startDate = parseDateToUTC(booking.start_date);
    const endDate = parseDateToUTC(booking.end_date);
    const nights = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    await transporter.sendMail({
      from: fromEmail,
      to: booking.email,
      subject: "Booking Submission Received - Wild Spruce Cabin",
      html: `
        <h2>Booking Submission Received</h2>
        <p>Hi ${booking.name},</p>
        <p>Thank you for your booking request! We've received your submission and will review it shortly.</p>
        
        <h3>Booking Dates:</h3>
        <ul>
          <li><strong>Check-in:</strong> ${startDate.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric", year: "numeric" })}</li>
          <li><strong>Check-out:</strong> ${endDate.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric", year: "numeric" })}</li>
          <li><strong>Number of Nights:</strong> ${nights}</li>
        </ul>
        
        <h3>Guest Information:</h3>
        <ul>
          <li><strong>Name:</strong> ${booking.name}</li>
          <li><strong>Email:</strong> ${booking.email}</li>
          <li><strong>Phone:</strong> ${booking.phone || "Not provided"}</li>
          <li><strong>Number of Guests:</strong> ${booking.guests}</li>
        </ul>
        
        <h3>Booking Reference:</h3>
        <p>${booking.id}</p>
        
        ${booking.notes ? `<h3>Special Requests:</h3><p>${booking.notes}</p>` : ""}
        
        <p>Our team will contact you at ${booking.phone || booking.email} to confirm your booking.</p>
        
        <p>Best regards,<br>Wild Spruce Cabin Team</p>
      `,
    });

    return { success: true };
  } catch (err) {
    console.error("Error sending confirmation email:", err);
    return { success: false, error: "Failed to send confirmation email" };
  }
}

// Send notification email to admin about new booking submission
export async function sendBookingNotificationToAdmin(booking: Booking) {
  try {
    const startDate = parseDateToUTC(booking.start_date);
    const endDate = parseDateToUTC(booking.end_date);
    const nights = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    await transporter.sendMail({
      from: fromEmail,
      to: adminEmail,
      subject: `New Booking Submission - ${booking.name} (${nights} nights)`,
      html: `
        <h2>New Booking Submission</h2>
        
        <h3>Guest Information:</h3>
        <ul>
          <li><strong>Name:</strong> ${booking.name}</li>
          <li><strong>Email:</strong> ${booking.email}</li>
          <li><strong>Phone:</strong> ${booking.phone || "Not provided"}</li>
          <li><strong>Guests:</strong> ${booking.guests}</li>
        </ul>
        
        <h3>Booking Dates:</h3>
        <ul>
          <li><strong>Check-in:</strong> ${startDate.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric", year: "numeric" })}</li>
          <li><strong>Check-out:</strong> ${endDate.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric", year: "numeric" })}</li>
          <li><strong>Number of Nights:</strong> ${nights}</li>
        </ul>
        
        ${booking.notes ? `<h3>Special Requests:</h3><p>${booking.notes}</p>` : ""}
        
        <h3>Booking Reference:</h3>
        <p>${booking.id}</p>
        
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://wildspruce.com"}/admin">Review in Admin Dashboard</a></p>
      `,
    });

    return { success: true };
  } catch (err) {
    console.error("Error sending admin notification:", err);
    return { success: false, error: "Failed to send admin notification" };
  }
}

// Send status update email to guest when booking status changes
export async function sendStatusUpdateEmail(booking: Booking) {
  try {
    const startDate = parseDateToUTC(booking.start_date);
    const endDate = parseDateToUTC(booking.end_date);
    const nights = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const statusMessages: Record<string, string> = {
      confirmed:
        "Your booking has been confirmed! We look forward to welcoming you.",
      cancelled:
        "Your booking has been cancelled. Please contact us if you have any questions.",
      pending: "Your booking is still pending review. We will update you soon.",
    };

    await transporter.sendMail({
      from: fromEmail,
      to: booking.email,
      subject: `Booking Status Update - Wild Spruce Cabin`,
      html: `
        <h2>Booking Status Update</h2>
        <p>Hi ${booking.name},</p>
        
        <p><strong>Status: ${booking.status.toUpperCase()}</strong></p>
        <p>${statusMessages[booking.status] || "Your booking status has been updated."}</p>
        
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Booking Reference:</strong> ${booking.id}</li>
          <li><strong>Check-in:</strong> ${startDate.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric", year: "numeric" })}</li>
          <li><strong>Check-out:</strong> ${endDate.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric", year: "numeric" })}</li>
          <li><strong>Number of Nights:</strong> ${nights}</li>
        </ul>
        
        <h3>Guest Information:</h3>
        <ul>
          <li><strong>Guest Name:</strong> ${booking.name}</li>
          <li><strong>Email:</strong> ${booking.email}</li>
          <li><strong>Phone:</strong> ${booking.phone || "Not provided"}</li>
          <li><strong>Number of Guests:</strong> ${booking.guests}</li>
        </ul>
        
        ${booking.notes ? `<h3>Special Requests:</h3><p>${booking.notes}</p>` : ""}
        
        <p>Best regards,<br>Wild Spruce Cabin Team</p>
      `,
    });

    return { success: true };
  } catch (err) {
    console.error("Error sending status update email:", err);
    return { success: false, error: "Failed to send status update email" };
  }
}

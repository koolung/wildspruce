# Cabin Booking System - Implementation Guide

## Overview

This document describes the production-ready backend for the Wild Spruce cabin booking system built with Next.js, Supabase, and Nodemailer.

---

## System Architecture

### Technology Stack
- **Framework**: Next.js (App Router) on Vercel
- **Database**: Supabase PostgreSQL
- **Backend**: Server Actions + Route Handlers
- **Email**: Nodemailer (SMTP)
- **Validation**: Zod
- **Authentication**: Session-based (env.local credentials)

### Core Components

```
src/
├── lib/
│   ├── supabase.ts           # Supabase client & database types
│   ├── validation.ts         # Zod validation schemas
│   ├── email.ts              # Nodemailer email templates
│   └── auth.ts               # Admin authentication middleware
├── actions/
│   └── bookings.ts           # Server Actions for bookings
├── app/
│   ├── api/admin/login.ts    # Login route handler
│   ├── admin/
│   │   ├── page.tsx          # Login page
│   │   └── dashboard/
│   │       └── page.tsx      # Admin dashboard (protected)
│   └── cottage/
│       └── page.tsx          # Guest booking page
└── components/admin/
    ├── AdminLogin.tsx        # Login form component
    └── AdminDashboard.tsx    # Dashboard UI component

DATABASE_SCHEMA.sql           # PostgreSQL schema for Supabase
.env.local.example            # Environment variables template
```

---

## Database Schema

### Tables

#### `bookings`
- **id**: UUID primary key
- **name**: Guest name (required)
- **email**: Guest email (required)
- **phone**: Guest phone (optional)
- **start_date**: Check-in date (UTC, YYYY-MM-DD format)
- **end_date**: Check-out date (UTC, YYYY-MM-DD format)
- **guests**: Number of guests (1-20)
- **notes**: Special requests (optional, max 1000 chars)
- **status**: Enum (pending | confirmed | cancelled)
- **created_at**: Timestamp when booking was submitted
- **updated_at**: Timestamp when booking was last updated

**Indexes**:
- `idx_bookings_date_range` on (start_date, end_date) - Query performance for date range checks
- `idx_bookings_status` on (status) - Fast status filtering
- `idx_bookings_email` on (email) - Duplicate prevention & rate limiting

#### `blocked_dates`
- **id**: UUID primary key
- **start_date**: First blocked date (UTC, YYYY-MM-DD format)
- **end_date**: Last blocked date (UTC, YYYY-MM-DD format)
- **reason**: Why dates are blocked (optional, e.g., "Maintenance")
- **created_at**: Timestamp when block was created
- **updated_at**: Timestamp when block was last updated

**Indexes**:
- `idx_blocked_dates_range` on (start_date, end_date) - Fast overlap checks

### Key Design Decisions

1. **Date Format**: Stored as ISO date strings (YYYY-MM-DD) in UTC. Timezone conversion happens only on the frontend.
2. **Status Enum**: PostgreSQL enum type ensures data integrity.
3. **Soft Delete Pattern**: Bookings are marked "cancelled" instead of deleted - preserves historical data.
4. **Row-Level Security**: Enabled but permissive by default (can be restricted later).

---

## Server Actions

All server actions are defined in `src/actions/bookings.ts`.

### 1. `createBooking(input)`

**Purpose**: Create a new guest booking

**Flow**:
1. Validates input with Zod schema
2. Rate limits by email (max 3 bookings per 24 hours)
3. Checks for overlapping bookings (confirmed/pending)
4. Checks against blocked dates
5. Creates booking with "pending" status
6. Sends confirmation emails (async)
7. Returns booking ID

**Input**:
```typescript
{
  name: string;              // 2-255 chars
  email: string;             // Valid email
  phone?: string;            // Optional, 10+ digits
  start_date: "YYYY-MM-DD";  // Today or future
  end_date: "YYYY-MM-DD";    // After start_date
  guests: number;            // 1-20
  notes?: string;            // Optional, max 1000 chars
}
```

**Output**:
```typescript
{
  success: boolean;
  bookingId?: string;        // UUID of new booking
  message?: string;          // Success message
  error?: string;            // Error message if failed
}
```

**Security**:
- Input sanitized and validated with Zod
- Rate limiting prevents spam
- Overlap checking prevents double-booking
- Service role key never exposed to client

---

### 2. `getAvailability(input)`

**Purpose**: Get list of unavailable dates within a date range

**Flow**:
1. Validates input dates
2. Queries all non-cancelled bookings in date range
3. Queries all blocked dates in date range
4. Returns array of unavailable date strings
5. Frontend uses this to disable dates on calendar

**Input**:
```typescript
{
  start_date: "YYYY-MM-DD";
  end_date: "YYYY-MM-DD";    // After start_date
}
```

**Output**:
```typescript
{
  success: boolean;
  unavailableDates: string[]; // Array of "YYYY-MM-DD" strings
  error?: string;             // If failed
}
```

**Usage**: Called when calendar loads or date range changes to update UI.

---

### 3. `adminUpdateBooking(input)`

**Purpose**: Update booking status (admin only)

**Authentication**: Must be called with valid admin session token (verified by middleware).

**Flow**:
1. Validates booking ID and new status
2. Updates booking in database
3. Sends status update email to guest
4. Returns success message

**Input**:
```typescript
{
  bookingId: string;                            // UUID
  status: "pending" | "confirmed" | "cancelled"; // New status
}
```

**Output**:
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
}
```

---

### 4. `blockDate(input)`

**Purpose**: Manually block dates from new bookings

**Authentication**: Admin only

**Flow**:
1. Validates date range
2. Inserts into blocked_dates table
3. Returns blocked date record

**Input**:
```typescript
{
  start_date: "YYYY-MM-DD";
  end_date: "YYYY-MM-DD";    // On or after start_date
  reason?: string;            // e.g., "Maintenance"
}
```

**Output**:
```typescript
{
  success: boolean;
  message?: string;
  blockedDate?: BlockedDate; // Newly created record
  error?: string;
}
```

---

### 5. `getAllBookings()`

**Purpose**: Fetch all bookings for admin dashboard

**Authentication**: Admin only

**Returns**: Array of all bookings sorted by creation date (newest first)

---

### 6. `getBlockedDates()`

**Purpose**: Fetch all blocked date ranges

**Authentication**: Admin only

**Returns**: Array of all blocked dates sorted by start_date

---

## Authentication & Authorization

### Admin Dashboard Access

The admin dashboard uses **session-based authentication** with credentials stored in environment variables.

**Implementation**:

1. **Login Flow**:
   - User enters credentials on `/admin` page
   - Frontend sends POST to `/api/admin/login` (server-side verification)
   - Server verifies credentials against `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `.env.local`
   - If valid, server creates secure session token and sets httpOnly cookie
   - User redirected to `/admin/dashboard`

2. **Session Verification**:
   - Protected pages call `isAdminAuthenticated()` in server component
   - Checks for valid session cookie
   - If invalid, redirects to `/admin` (login page)
   - Session lasts 24 hours by default

3. **Logout**:
   - Logout button calls `clearAdminSession()` server action
   - Deletes session cookie
   - User redirected to `/admin`

### Security Features

#### Credential Protection
- **Injection Prevention**: `sanitizeInput()` removes null bytes, line breaks, and limits special characters
- **Constant-Time Comparison**: Prevents timing attacks during credential verification
- **Environment Variables**: Credentials stored in `.env.local`, never hardcoded
- **No Client-Side Storage**: Credentials never exposed to browser

#### Session Security
- **HttpOnly Cookies**: JavaScript cannot access session token (XSS protection)
- **Secure Flag**: Cookie only sent over HTTPS (in production)
- **SameSite: Strict**: Prevents CSRF attacks
- **Random Token**: Session token is 256-bit random value, not derived from credentials

#### API Protection
- **Server Actions**: All mutations happen on server, no direct database access
- **Service Role Key**: Supabase service role key never exposed to client
- **Input Validation**: All inputs validated with Zod before database operations

---

## Email Service

### Configuration (Nodemailer)

**Environment Variables**:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=bookings@wildspruce.com
ADMIN_EMAIL=admin@wildspruce.com
```

### Email Templates

#### 1. Booking Confirmation (to guest)
- Triggered: Immediately after booking submission
- Content: Booking details, reference ID, next steps
- Personalized with guest name

#### 2. Admin Notification (to admin)
- Triggered: Immediately after booking submission
- Content: Full guest & booking details
- Includes link to admin dashboard

#### 3. Status Update (to guest)
- Triggered: When booking status changes
- Content: New status and appropriate message
- Status messages:
  - Confirmed: "We look forward to welcoming you"
  - Cancelled: "Please contact us if you have questions"
  - Pending: "We will update you soon"

---

## Date Handling

### Core Principle: UTC in Database, Local in UI

**Database**:
- All dates stored in UTC as YYYY-MM-DD strings (ISO 8601)
- Enables accurate comparison and overlap detection
- Eliminates timezone-related bugs

**Frontend**:
- Convert UTC dates to user's local timezone for display
- Use `toLocaleDateString()` for consistent formatting
- Example: `"2026-03-15"` (UTC) → formatted as user sees it

**Validation**:
- Zod schemas validate date format (YYYY-MM-DD)
- Server actions normalize all dates to UTC
- Both start_date and end_date validated in UTC context

**Overlap Detection**:
```typescript
// Check if two date ranges overlap
function datesOverlap(start1, end1, start2, end2): boolean {
  return start1 <= end2 && end1 >= start2;
}

// Applied in createBooking:
// existing.start_date <= requested_end AND existing.end_date >= requested_start
```

---

## Rate Limiting Strategy

### Implementation: Email-Based Rate Limiting (No External Service)

**Approach**: Query-based rate limiting - no redis or external service needed.

**Rules**:
- Max 3 booking attempts per email per 24 hours
- Allows genuine guests to retry if needed
- Prevents spam/automated attacks

**Code** (in `createBooking`):
```typescript
const oneDayAgo = new Date();
oneDayAgo.setUTCDate(oneDayAgo.getUTCDate() - 1);

const { data: recentBookings } = await supabase
  .from("bookings")
  .select("id")
  .eq("email", validatedInput.email)
  .gte("created_at", oneDayAgo.toISOString())
  .limit(3);

if (recentBookings?.length >= 3) {
  return { success: false, error: "Too many requests..." };
}
```

**Why This Approach**:
- ✅ No external service (redis) needed
- ✅ Scales with Supabase
- ✅ Persists across restarts
- ✅ Works with Vercel serverless
- ⚠️ If needed, upgrade to Redis for stricter IP-based limits

### Future Improvements
- IP-based rate limiting (prevent multiple emails from same IP)
- Progressive delays (longer wait after each attempt)
- Temporary blocks (lock account after N failures)
- Require email verification before booking

---

## Edge Cases

### 1. Same-Day Check-In/Check-Out
- End date = next day (don't allow same day in/out)
- Checked in validators: `refine(data => new Date(data.end_date) > new Date(data.start_date))`

### 2. Booking After Midnight (Timezone Issues)
- All dates stored UTC, comparison happens in UTC
- No off-by-one errors possible
- Frontend shows local dates, not UTC

### 3. Concurrent Bookings (Race Condition)
- Supabase handles concurrent transactions
- Overlap check + insert happens atomically within action
- If two users book simultaneously for same dates, second request fails gracefully

### 4. Status Transitions
- Pending → Confirmed/Cancelled (allowed)
- Confirmed → Cancelled (allowed)
- Cancelled → ? (can be re-confirmed if needed)
- Email sent regardless of previous status

### 5. Duplicate Submissions
- No unique constraint on email+dates (allowed duplicates in pending state)
- Rate limiting prevents spam
- Admin can manually delete or cancel duplicates

---

## Deployment Checklist

### Before Going Live

- [ ] Configure `.env.local` with production credentials
  - [ ] Supabase URL and service role key
  - [ ] ADMIN_USERNAME and ADMIN_PASSWORD (strong password!)
  - [ ] SMTP credentials for email service
  - [ ] NEXT_PUBLIC_SITE_URL for production domain

- [ ] Run database schema migration in Supabase
  - [ ] Execute `DATABASE_SCHEMA.sql` 
  - [ ] Verify tables and indexes created

- [ ] Test email sending
  - [ ] Submit test booking
  - [ ] Check guest inbox for confirmation
  - [ ] Check admin inbox for notification

- [ ] Test admin dashboard
  - [ ] Login with credentials
  - [ ] Update booking status
  - [ ] Block dates
  - [ ] Logout

- [ ] Test availability calendar
  - [ ] Try overlapping dates
  - [ ] Try blocked dates
  - [ ] Verify database queries are fast

- [ ] Verify security
  - [ ] Session cookie is secure (httpOnly, Secure, SameSite)
  - [ ] Admin credentials not logged or exposed
  - [ ] Rate limiting works

- [ ] Performance check
  - [ ] `npm run build` succeeds
  - [ ] No TypeScript errors
  - [ ] Bundle size acceptable
  - [ ] Database queries optimized

### Production Setup

1. **Environment Variables** (Vercel admin panel):
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=
   ADMIN_USERNAME=
   ADMIN_PASSWORD=
   SMTP_HOST=
   SMTP_PORT=
   SMTP_SECURE=true (for 465 port)
   SMTP_USER=
   SMTP_PASSWORD=
   SMTP_FROM_EMAIL=
   ADMIN_EMAIL=
   ```

2. **Database**:
   - Create Supabase project
   - Run schema migration
   - Verify Row Level Security policies

3. **Email Provider**:
   - Configure SMTP credentials
   - Test sending
   - Setup email forwarding (optional)

4. **Domain & SSL**:
   - Configure custom domain in Vercel
   - SSL certificate auto-provisioned

---

## Monitoring & Maintenance

### Key Metrics
- Booking submission success rate
- Email delivery rate
- Admin login frequency
- Database query times

### Troubleshooting

**Problem**: Bookings not creating
- Check Supabase connection & credentials
- Verify database tables exist
- Check for date overlap issues

**Problem**: Emails not sending
- Test SMTP credentials manually
- Check spam folder
- Verify email headers not malformed

**Problem**: Admin login fails
- Verify ADMIN_USERNAME and ADMIN_PASSWORD are set
- Check for typos in credentials
- Clear browser cookies and retry

**Problem**: Availability shows wrong dates
- Check UTC timezone handling
- Verify blocked_dates data
- Test with explicit date range

---

## Future Enhancements

### Phase 2
- Multi-cabin support (add `cabin_id` to bookings)
- Pricing per night (add `price_per_night` to bookings)
- Discount codes (Stripe integration)

### Phase 3
- Calendar sync (iCal export for Airbnb/VRBO)
- Guest login (track their bookings)
- Payment processing (Stripe embedded)
- Automated reminders (email 1 day before arrival)

### Phase 4
- Multi-language support
- SMS notifications
- Mobile app (React Native)
- Analytics dashboard

---

## Support & Questions

For issues or questions:
1. Check error logs in Supabase/Vercel dashboards
2. Verify environment variables are set
3. Test components independently
4. Check database schema matches implementation

---

**Last Updated**: March 2026  
**Status**: Production Ready  
**Version**: 1.0.0

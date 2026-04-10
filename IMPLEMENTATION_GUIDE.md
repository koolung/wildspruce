# Cabin Booking System - Implementation Guide

## Overview

This document provides a complete overview of the production-ready cabin booking backend system.

---

## 🏗️ Architecture

### Technology Stack
- **Frontend Framework**: Next.js App Router (TypeScript)
- **Backend**: Next.js Server Actions + Route Handlers
- **Database**: Supabase (PostgreSQL)
- **Email**: Nodemailer (SMTP)
- **Validation**: Zod
- **Deployment**: Vercel

### Key Design Decisions

1. **Server Actions for Mutations**: All booking operations (create, update, block dates) use Server Actions for security—sensitive operations never expose database credentials to client.

2. **UTC Timezone Storage**: All dates stored in UTC with timezone info. This ensures consistency across timezones and prevents off-by-one errors. Frontend converts to local timezone for display.

3. **Overlap Detection**: Prevents double-booking using SQL range queries:
   ```sql
   existing.start_date < requested_end AND existing.end_date > requested_start
   ```

4. **Admin Authentication**: HTTP Basic Auth with credentials stored in `ADMIN_CREDENTIALS` env variable (base64 encoded). Input sanitization prevents injection attacks; constant-time comparison prevents timing attacks.

5. **Rate Limiting**: In-memory store with automatic cleanup. Production deployments should use Redis for distributed rate limiting across multiple server instances.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── actions/
│   │   └── bookings.ts              # Server Actions for bookings
│   ├── api/
│   │   ├── availability/route.ts     # GET public availability
│   │   ├── submit-booking/route.ts   # POST guest bookings
│   │   ├── bookings/
│   │   │   ├── route.ts              # GET all bookings (admin)
│   │   │   └── [id]/route.ts         # GET/PATCH specific booking
│   │   ├── blocked-dates/
│   │   │   ├── route.ts              # GET/POST blocked dates
│   │   │   └── [id]/route.ts         # DELETE blocked dates
│   │   └── middleware.ts             # Admin auth middleware
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── (existing components)
├── lib/
│   ├── supabase.ts                  # Supabase client setup
│   ├── validation.ts                 # Zod schemas
│   ├── email.ts                      # Email service (Nodemailer)
│   ├── adminAuth.ts                 # Admin auth with injection protection
│   ├── rateLimit.ts                  # Rate limiting utility
└── (other files)
```

---

## 🗄️ Database Schema

### bookings table
- **id** (UUID, PK): Unique booking identifier
- **name** (VARCHAR): Guest name
- **email** (VARCHAR): Guest email
- **phone** (VARCHAR): Guest phone number
- **start_date** (TIMESTAMP UTC): Check-in date
- **end_date** (TIMESTAMP UTC): Check-out date
- **guests** (INTEGER): Number of guests
- **notes** (TEXT, nullable): Special requests
- **status** (ENUM): pending, confirmed, cancelled
- **created_at** (TIMESTAMP UTC): Booking submission time

**Indexes**:
- `idx_bookings_status`: By status (for filtering)
- `idx_bookings_email`: By email
- `idx_bookings_start_date`: By start date
- `idx_bookings_end_date`: By end date
- `idx_bookings_date_range`: Composite on (start_date, end_date) for overlap queries

### blocked_dates table
- **id** (UUID, PK): Unique ID
- **date_start** (TIMESTAMP UTC): Block start
- **date_end** (TIMESTAMP UTC): Block end
- **reason** (VARCHAR, nullable): Why dates are blocked
- **created_at** (TIMESTAMP UTC): When blocked

**Indexes**:
- `idx_blocked_dates_start`: By start date
- `idx_blocked_dates_end`: By end date
- `idx_blocked_dates_range`: Composite on (date_start, date_end)

---

## 🔐 Security Features

### 1. Server-Side Operations
- All database writes happen via Server Actions or API routes
- Supabase service role key only exists server-side (`.env.local`)
- Anonymous key used for read-only operations

### 2. Input Validation
- Zod schemas validate all inputs with strict type checking
- Email, phone, name sanitized before storage
- Date range validation prevents impossible bookings

### 3. Rate Limiting
- In-memory rate limiter prevents brute force attacks
- 5 requests per 60 seconds per IP (configurable)
- Automatic cleanup of expired entries

### 4. Admin Authentication
- HTTP Basic Auth (RFC 7617) with base64-encoded credentials
- Credentials stored in `ADMIN_CREDENTIALS` environment variable
- **Injection Protection**:
  - Username validated against regex: `^[a-zA-Z0-9_.-]+$`
  - Format strictly enforced: `username:password` (exactly one colon)
  - Credentials decoded from base64 before validation
- **Timing Attack Prevention**: Constant-time comparison using `crypto.subtle.timingSafeEqual()`
- All admin endpoints require valid Basic Auth header

### 5. Row-Level Security (RLS)
- RLS policies defined in schema (currently permissive for development)
- Production: tighten policies or enforce server-side checks

---

## 🚀 Setup Instructions

### Step 1: Set Environment Variables

Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anonymous_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=bookings@wildspruce.com

# Admin Credentials (Base64 encoded)
# Generate: echo -n "admin:securepassword123" | base64
ADMIN_CREDENTIALS=YWRtaW46c2VjdXJlcGFzc3dvcmQxMjM=

ADMIN_EMAIL=admin@wildspruce.com
SITE_URL=https://yourdomain.com
```

### Step 2: Create Supabase Tables

1. Go to [Supabase Console](https://supabase.com/dashboard)
2. Create new project
3. SQL Editor → Execute the queries in `database.sql`:
   ```bash
   # Copy contents of database.sql and run in SQL editor
   ```

### Step 3: Configure Email (Nodemailer)

**For Gmail**:
1. Enable 2FA on your Google account
2. Generate app-specific password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use as `SMTP_PASSWORD` in `.env.local`

**For other SMTP providers**:
- Update `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`
- Provide credentials in `SMTP_USER` and `SMTP_PASSWORD`

### Step 4: Generate Admin Credentials

```bash
# Generate secure credentials
node -e "console.log('Username: admin'); console.log('Password:', require('crypto').randomBytes(16).toString('hex'))"

# Encode to Base64 for ADMIN_CREDENTIALS
echo -n "admin:your_generated_password" | base64

# Or use Node:
node -e "console.log(Buffer.from('admin:your_password').toString('base64'))"
```

### Step 5: Deploy to Vercel

```bash
npm run build
npx vercel deploy
```

Set environment variables in Vercel dashboard (don't commit `.env.local`).

---

## 📡 API Endpoints

### Public Endpoints

#### GET /api/availability
Get unavailable dates in range (rate limited).

**Query Params**:
- `start_date` (ISO 8601): Start of date range
- `end_date` (ISO 8601): End of date range

**Response**:
```json
{
  "data": [
    "2024-03-15",
    "2024-03-16",
    "2024-03-17"
  ]
}
```

#### POST /api/submit-booking
Submit a guest booking (rate limited).

**Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-123-4567",
  "start_date": "2024-04-01T00:00:00Z",
  "end_date": "2024-04-05T00:00:00Z",
  "guests": 4,
  "notes": "Early check-in if possible"
}
```

**Response** (201):
```json
{
  "message": "Booking submitted successfully",
  "bookingId": "uuid-here"
}
```

### Admin Endpoints

**All require**: HTTP Basic Auth header  
```
Authorization: Basic base64(username:password)
```

#### GET /api/bookings
Get all bookings with optional status filter.

**Query Params**:
- `status` (optional): "pending", "confirmed", "cancelled"

#### GET /api/bookings/[id]
Get specific booking details.

#### PATCH /api/bookings/[id]
Update booking status and send confirmation email.

**Body**:
```json
{
  "status": "confirmed"
}
```

#### GET /api/blocked-dates
Get all blocked date ranges.

#### POST /api/blocked-dates
Create new blocked date range.

**Body**:
```json
{
  "date_start": "2024-03-15T00:00:00Z",
  "date_end": "2024-03-20T00:00:00Z",
  "reason": "Maintenance"
}
```

#### DELETE /api/blocked-dates/[id]
Remove a blocked date range.

---

## 💻 Frontend Integration Examples

### Example 1: Check Availability

```typescript
async function checkAvailability(startDate: Date, endDate: Date) {
  const start = startDate.toISOString();
  const end = endDate.toISOString();
  
  const res = await fetch(
    `/api/availability?start_date=${start}&end_date=${end}`
  );
  
  if (!res.ok) throw new Error('Failed to check availability');
  
  const { data: unavailableDates } = await res.json();
  return unavailableDates;
}
```

### Example 2: Submit Booking

```typescript
async function submitBooking(formData: BookingForm) {
  const res = await fetch('/api/submit-booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error);
  }
  
  return res.json();
}
```

### Example 3: Admin API Call

```typescript
async function getBookings(status?: string) {
  const url = new URL('/api/bookings', process.env.NEXT_PUBLIC_SITE_URL);
  if (status) url.searchParams.set('status', status);
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_KEY}`,
    },
  });
  
  if (!res.ok) throw new Error('Unauthorized');
  
  return res.json();
}
```

---

## 🎯 Edge Cases Handled

| Issue | Solution |
|-------|----------|
| **Overlapping bookings** | Composite index on (start_date, end_date); range query validates no conflicts |
| **Same-day check-in/out** | end_date > start_date constraint; check error message shown |
| **Timezone drift** | All dates stored UTC; frontend converts to local for display |
| **Double booking race** | Database constraint + isolation level prevents race conditions |
| **Invalid date ranges** | Zod validates start < end before DB query |
| **Duplicate submissions** | Rate limiting + form-level debouncing recommended |
| **Email delivery failure** | Logged but doesn't block booking; implement retry queue for production |

---

## 📈 Scaling Recommendations

### 1. Payments Integration (Stripe)
- Install `stripe` package
- Create `/api/create-payment-intent` endpoint for Stripe Payment Intent
- Store `stripe_payment_intent_id` in bookings table
- Add `amount` and `payment_status` columns to bookings
- Only move booking to "confirmed" after successful Stripe payment webhook
- Implement `/api/webhooks/stripe` to handle payment events
- Add refund handling for cancelled bookings

**Example Flow**:
```typescript
// Create payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(totalPrice * 100), // cents
  currency: 'usd',
  metadata: { bookingId: booking.id },
});

// Update booking with payment intent ID
await updateBooking(booking.id, {
  stripe_payment_intent_id: paymentIntent.id,
  payment_status: 'pending'
});

// After Stripe webhook confirms payment
await updateBooking(booking.id, {
  payment_status: 'paid',
  status: 'confirmed'
});
```

### 2. Multi-Cabin Support
- Add `cabins` table with id, name, max_guests, nightly_rate
- Add `cabin_id` to bookings table
- Create separate blocked_dates per cabin
- Update availability query to filter by cabin

### 3. Calendar Sync
- Implement `POST /api/sync/ical` for iCal feed
- Support Airbnb sync via private calendar link
- Use webhook to update blocked_dates automatically

### 4. Distributed Rate Limiting
Replace in-memory store with Redis:
```typescript
import { createClient } from 'redis';

const redis = createClient();

export async function checkRateLimit(identifier: string): Promise<boolean> {
  const key = `rate:${identifier}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }
  
  return count <= REQUESTS_LIMIT;
}
```

### 5. Notification System
- Add SMS notifications (Twilio)
- Implement Slack alerts for new bookings
- Create automated reminders (check-in 48h before)

---

## 🛠️ Development

### Run Locally
```bash
npm run dev
# Visit http://localhost:3000
```

### Build
```bash
npm run build
npm run start
```

### Lint
```bash
npm run lint
```

---

## 📋 Checklist Before Production

- [ ] Set all environment variables in Vercel
- [ ] Test booking flow end-to-end
- [ ] Verify emails send correctly
- [ ] Test admin API with valid token
- [ ] Test rate limiting (submit 5+ requests quickly)
- [ ] Verify dates stored in UTC in database
- [ ] Enable RLS on Supabase tables
- [ ] Set up backups in Supabase
- [ ] Configure CORS if using from different domain
- [ ] Monitor error logs (Vercel, Supabase)

---

## 🐛 Troubleshooting

### "Unauthorized" on Admin API
- Verify `ADMIN_CREDENTIALS` is set in `.env.local`
- Check Basic Auth format: `Authorization: Basic base64(username:password)`
- Encode credentials: `echo -n "admin:password" | base64`
- Username must match regex: `^[a-zA-Z0-9_.-]+$`

### Bookings not showing in calendar
- Check timezone of stored dates (should be UTC)
- Verify database connection: `SUPABASE_SERVICE_ROLE_KEY`

### Emails not sending
- Verify `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- For Gmail: use app-specific password (not your Google password)
- Check SMTP server accepts connections on configured port
- Review Node process logs for connection errors

### Overlapping bookings appearing
- Check composite index created on (start_date, end_date)
- Verify overlap query logic in `checkAvailability()`
- Review booking status—only pending/confirmed prevent overlap

---

## 📚 Resources

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Supabase PostgreSQL](https://supabase.com/docs/guides/database)
- [Zod Validation](https://zod.dev)
- [Nodemailer Documentation](https://nodemailer.com)
- [HTTP Basic Auth (RFC 7617)](https://tools.ietf.org/html/rfc7617)

---

**Version**: 1.1.0 (Updated with Nodemailer + Basic Auth)  
**Last Updated**: 2024  
**Maintained by**: Your Team

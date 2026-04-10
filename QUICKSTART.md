# Cabin Booking System - Quick Start

## 1️⃣ Setup (5 minutes)

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Fill in values from Supabase & Gmail
nano .env.local

# 3. Generate admin credentials
node -e "console.log(Buffer.from('admin:your_secure_password').toString('base64'))"

# 4. Add to .env.local as ADMIN_CREDENTIALS
```

## 2️⃣ Database Setup (Supabase)

1. Go to [Supabase Console](https://supabase.com/dashboard)
2. Create new project
3. Go to SQL Editor
4. Run all queries from `database.sql`
5. Copy project URL and keys to `.env.local`

## 3️⃣ Email Configuration (Gmail + Nodemailer)

1. Enable 2FA on your Google account
2. Generate app-specific password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Add to `.env.local`:
   ```
   SMTP_USER=your_gmail@gmail.com
   SMTP_PASSWORD=your_app_specific_password
   ```

## 4️⃣ Test Locally

```bash
npm run dev
# Open http://localhost:3000

# Test API endpoints:
curl http://localhost:3000/api/availability\?start_date=2024-04-01T00:00:00Z\&end_date=2024-04-10T00:00:00Z

# Submit booking:
curl -X POST http://localhost:3000/api/submit-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "test@example.com",
    "phone": "555-1234",
    "start_date": "2024-04-05T00:00:00Z",
    "end_date": "2024-04-10T00:00:00Z",
    "guests": 2
  }'

# Get admin bookings (with Basic Auth):
curl http://localhost:3000/api/bookings \
  -H "Authorization: Basic $(echo -n 'admin:your_password' | base64)"
```

## 5️⃣ Deploy to Vercel

```bash
npm run build
npx vercel deploy
```

Set environment variables in Vercel dashboard.

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| `database.sql` | PostgreSQL schema |
| `src/actions/bookings.ts` | Server Actions |
| `src/lib/validation.ts` | Zod schemas |
| `src/lib/email.ts` | Email templates |
| `src/app/api/*` | API routes |
| `IMPLEMENTATION_GUIDE.md` | Full documentation |

---

## 🔍 Understanding the Flow

**Guest Books → Booking** (Public)
1. Guest submits form via `/api/submit-booking`
2. Server validates with Zod
3. Checks overlap against DB
4. Sends confirmation emails
5. Returns booking ID

**Admin Updates Booking** (Protected)
1. Admin calls `/api/bookings/[id]` with Bearer token
2. Server verifies admin token
3. Updates status in DB
4. Sends status email to guest

**Check Availability** (Public, Rate Limited)
1. Frontend calls `/api/availability?start_date=...&end_date=...`
2. Server returns list of unavailable dates
3. Frontend highlights on calendar

---

## ⚠️ Important Notes

- **All dates are stored in UTC** → Convert for display on frontend
- **Emails send via Nodemailer** → Configure SMTP in `.env.local`
- **Admin auth uses HTTP Basic Auth** → Format: `Authorization: Basic base64(username:password)`
- **Injection-protected** → Username validated, timing-safe comparison
- **Rate limiting is in-memory** → Use Redis for production at scale
- **No user login required** → Bookings are guest-only, admin uses Basic Auth

---

See `IMPLEMENTATION_GUIDE.md` for complete documentation.

# Supabase Setup Guide

## Initial Database Setup

### 1. Create Tables and Schema

Run the complete **DATABASE_SCHEMA.sql** file in your Supabase SQL Editor:

1. Go to **Supabase Dashboard** → Your Project → **SQL Editor**
2. Create a new query
3. Copy and paste the entire contents of `DATABASE_SCHEMA.sql`
4. Click **Execute**

### 2. Fix updated_at Trigger Issue

If you encounter the error: `record "new" has no field "updated_at"` when updating bookings, the columns may be missing. 

Run these commands in the Supabase SQL Editor **in this order**:

```sql
-- First, add the missing columns if they don't exist
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE blocked_dates ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE blocked_dates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Now drop the existing triggers that may be causing issues
DROP TRIGGER IF EXISTS trigger_update_bookings_updated_at ON bookings CASCADE;
DROP TRIGGER IF EXISTS trigger_update_blocked_dates_updated_at ON blocked_dates CASCADE;

-- Drop the existing functions
DROP FUNCTION IF EXISTS update_bookings_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_blocked_dates_updated_at() CASCADE;

-- Recreate the functions correctly
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_blocked_dates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the triggers
CREATE TRIGGER trigger_update_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_bookings_updated_at();

CREATE TRIGGER trigger_update_blocked_dates_updated_at
BEFORE UPDATE ON blocked_dates
FOR EACH ROW
EXECUTE FUNCTION update_blocked_dates_updated_at();
```

### 3. Enable Row Level Security (Optional)

For production, you may want to enable RLS:

```sql
-- Enable RLS on both tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- Create a policy allowing all operations (for development)
-- In production, replace with more restrictive policies
CREATE POLICY "Allow all operations on bookings" ON bookings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on blocked_dates" ON blocked_dates
  FOR ALL USING (true) WITH CHECK (true);
```

### 4. Verify Setup

Check that tables created successfully:

```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Verify indexes
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public';
```

## Environment Variables

Ensure your `.env.local` file contains:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Get these values from:
- **Supabase Dashboard** → Settings → API → Project URL (NEXT_PUBLIC_SUPABASE_URL)
- **Supabase Dashboard** → Settings → API → Service Role Secret Key (SUPABASE_SERVICE_ROLE_KEY)

## Troubleshooting

### Issue: "record 'new' has no field 'updated_at'"

**Solution:** Run the "Fix updated_at Trigger Issue" section above to drop and recreate the triggers properly.

### Issue: Bookings not saving

**Check:**
1. Service role key is correct in `.env.local`
2. Tables exist in Supabase
3. No RLS policies are blocking inserts (if RLS is enabled)

### Issue: Foreign key or constraint errors

**Solution:** Ensure you haven't created any additional constraints that weren't in the original schema.

## Common SQL Queries

View all bookings:
```sql
SELECT * FROM bookings ORDER BY created_at DESC;
```

View all blocked dates:
```sql
SELECT * FROM blocked_dates ORDER BY date_start ASC;
```

Delete all test data:
```sql
DELETE FROM bookings;
DELETE FROM blocked_dates;
```

Check trigger status:
```sql
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

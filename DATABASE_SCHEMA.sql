-- Cabin Booking Database Schema for Supabase (PostgreSQL)
-- Run these commands in Supabase SQL Editor
-- Execute this ENTIRE script at once to create all tables, enums, and indexes

-- Create custom types (enums)
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  guests INTEGER NOT NULL CHECK (guests > 0),
  notes TEXT,
  status booking_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create blocked_dates table
CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  reason VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for optimal query performance
-- Index for date range queries on bookings
CREATE INDEX IF NOT EXISTS idx_bookings_date_range ON bookings(start_date, end_date);

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Index for email lookups (for duplicate prevention)
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);

-- Index for date range queries on blocked_dates
CREATE INDEX IF NOT EXISTS idx_blocked_dates_range ON blocked_dates(date_start, date_end);

-- Create updated_at trigger for bookings
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_bookings_updated_at();

-- Create updated_at trigger for blocked_dates
CREATE OR REPLACE FUNCTION update_blocked_dates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_blocked_dates_updated_at
BEFORE UPDATE ON blocked_dates
FOR EACH ROW
EXECUTE FUNCTION update_blocked_dates_updated_at();

-- Enable Row Level Security (optional but recommended)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- Create a policy allowing public read on bookings (optional)
-- This allows fetching availability without authentication
CREATE POLICY "Allow public read on bookings"
ON bookings FOR SELECT
USING (true);

-- Comment on tables for documentation
COMMENT ON TABLE bookings IS 'Guest cabin bookings with date ranges and status tracking';
COMMENT ON TABLE blocked_dates IS 'Manually blocked dates that prevent new bookings';
COMMENT ON COLUMN bookings.start_date IS 'Check-in date (UTC)';
COMMENT ON COLUMN bookings.end_date IS 'Check-out date (UTC)';
COMMENT ON COLUMN bookings.status IS 'Booking status: pending (awaiting confirmation), confirmed (approved), or cancelled';
COMMENT ON COLUMN blocked_dates.date_start IS 'First blocked date (UTC)';
COMMENT ON COLUMN blocked_dates.date_end IS 'Last blocked date (UTC)';

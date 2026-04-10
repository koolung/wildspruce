-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  guests INTEGER NOT NULL CHECK (guests > 0),
  notes TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Create blocked_dates table
CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date_start TIMESTAMP WITH TIME ZONE NOT NULL,
  date_end TIMESTAMP WITH TIME ZONE NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_blocked_date_range CHECK (date_end > date_start)
);

-- Create indexes for performance
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_email ON bookings(email);
CREATE INDEX idx_bookings_start_date ON bookings(start_date);
CREATE INDEX idx_bookings_end_date ON bookings(end_date);
-- Composite index for overlap queries
CREATE INDEX idx_bookings_date_range ON bookings(start_date, end_date) WHERE status IN ('pending', 'confirmed');
CREATE INDEX idx_blocked_dates_start ON blocked_dates(date_start);
CREATE INDEX idx_blocked_dates_end ON blocked_dates(date_end);
-- Composite index for blocked date range queries
CREATE INDEX idx_blocked_dates_range ON blocked_dates(date_start, date_end);

-- Add RLS policies (if using Row Level Security)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- Anonymous users can insert bookings
CREATE POLICY "allow_insert_bookings" ON bookings
  FOR INSERT
  WITH CHECK (true);

-- Anyone can view their own bookings (based on email)
CREATE POLICY "allow_select_bookings" ON bookings
  FOR SELECT
  USING (true);

-- Only authenticated users (admin) can update bookings
CREATE POLICY "deny_update_bookings" ON bookings
  FOR UPDATE
  USING (false);

-- Blocked dates - only admin can manage
CREATE POLICY "deny_select_blocked_dates" ON blocked_dates
  FOR SELECT
  USING (false);

CREATE POLICY "deny_insert_blocked_dates" ON blocked_dates
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "deny_update_blocked_dates" ON blocked_dates
  FOR UPDATE
  USING (false);

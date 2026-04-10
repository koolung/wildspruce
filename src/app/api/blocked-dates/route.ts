import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { blockDateSchema } from '@/lib/validation';
import { verifyAdminAuth } from '@/lib/adminAuth';

/**
 * GET /api/blocked-dates
 * Get all blocked dates (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin credentials
    const isAuthorized = await verifyAdminAuth(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: blockedDates, error } = await supabase
      .from('blocked_dates')
      .select('*')
      .order('date_start', { ascending: true });

    if (error) {
      console.error('Error fetching blocked dates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch blocked dates' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: blockedDates });
  } catch (error) {
    console.error('Error in GET /api/blocked-dates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blocked-dates
 * Create a new blocked date range (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin credentials
    const isAuthorized = await verifyAdminAuth(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedInput = blockDateSchema.parse(body);

    // Insert blocked date
    const { data: blockedDate, error: insertError } = await supabase
      .from('blocked_dates')
      .insert({
        date_start: validatedInput.start_date,
        date_end: validatedInput.end_date,
        reason: validatedInput.reason,
      })
      .select()
      .single();

    if (insertError || !blockedDate) {
      console.error('Error creating blocked date:', insertError);
      return NextResponse.json(
        { error: 'Failed to create blocked date' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: blockedDate }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    console.error('Error in POST /api/blocked-dates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

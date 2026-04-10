import { NextRequest, NextResponse } from 'next/server';
import { getAvailability } from '@/actions/bookings';

/**
 * GET /api/availability
 * Get unavailable dates in a range (no rate limiting - for calendar view)
 * Query params: start_date, end_date
 */
export async function GET(request: NextRequest) {
  try {
    const startDate = request.nextUrl.searchParams.get('start_date');
    const endDate = request.nextUrl.searchParams.get('end_date');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: start_date, end_date' },
        { status: 400 }
      );
    }

    const result = await getAvailability({
      start_date: startDate,
      end_date: endDate,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ unavailableDates: result.unavailableDates });
  } catch (error) {
    console.error('Error in GET /api/availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/availability
 * Get unavailable dates in a range (no rate limiting - for calendar component)
 * Body: { start_date: string, end_date: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { start_date, end_date } = body;

    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: 'Missing required parameters: start_date, end_date' },
        { status: 400 }
      );
    }

    const result = await getAvailability({
      start_date,
      end_date,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ unavailableDates: result.unavailableDates });
  } catch (error) {
    console.error('Error in POST /api/availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

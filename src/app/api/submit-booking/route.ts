import { NextRequest, NextResponse } from 'next/server';
import { createBooking } from '@/actions/bookings';
import { checkRateLimit, getClientIdentifier } from '@/lib/rateLimit';

/**
 * POST /api/submit-booking
 * Submit a new booking (public endpoint with rate limiting)
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit by client IP
    const clientId = getClientIdentifier(request.headers);
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    const result = await createBooking(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: result.message,
        bookingId: result.bookingId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/submit-booking:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create booking: ${message}` },
      { status: 500 }
    );
  }
}

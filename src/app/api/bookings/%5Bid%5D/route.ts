import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { updateBookingStatusSchema } from '@/lib/validation';
import { sendStatusUpdateEmail } from '@/lib/email';
import { verifyAdminAuth } from '@/lib/adminAuth';

/**
 * GET /api/bookings/[id]
 * Get a specific booking (admin only)
 */
// @ts-ignore - Next.js dynamic route params
export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    // Verify admin credentials
    const isAuthorized = await verifyAdminAuth(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: booking });
  } catch (error) {
    console.error('Error in GET /api/bookings/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/bookings/[id]
 * Update booking status (admin only)
 */
// @ts-ignore - Next.js dynamic route params
export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    // Verify admin credentials
    const isAuthorized = await verifyAdminAuth(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    // Validate input
    const validation = updateBookingStatusSchema.parse({
      bookingId: id,
      status: body.status,
    });

    // Check booking exists
    const { data: currentBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({ status: validation.status })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updatedBooking) {
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      );
    }

    // Send status update email (non-blocking)
    if (validation.status !== 'pending') {
      sendStatusUpdateEmail(updatedBooking).catch((err) => {
        console.error('Error sending status email:', err);
      });
    }

    return NextResponse.json({ data: updatedBooking });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    console.error('Error in PATCH /api/bookings/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/adminAuth';

/**
 * DELETE /api/blocked-dates/[id]
 * Delete a blocked date range (admin only)
 */
// @ts-ignore - Next.js dynamic route params
export async function DELETE(
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

    const { error } = await supabase
      .from('blocked_dates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blocked date:', error);
      return NextResponse.json(
        { error: 'Failed to delete blocked date' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Blocked date deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/blocked-dates/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

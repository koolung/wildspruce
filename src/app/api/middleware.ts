import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/adminAuth';

export const adminMiddleware = async (
  req: Request,
  handler: (req: Request) => Promise<NextResponse>
) => {
  // Verify Basic Auth credentials
  const isAuthorized = await verifyAdminAuth(req);

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return handler(req);
};

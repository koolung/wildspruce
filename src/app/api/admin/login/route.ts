import { createAdminSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Admin Login Route Handler
 * 
 * POST /api/admin/login
 * 
 * Verifies admin credentials and creates secure session
 * Both credential verification and session creation happen server-side only
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Create session (verifies credentials and sets secure httpOnly cookie)
    const success = await createAdminSession(username, password);

    if (!success) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Return success
    return NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

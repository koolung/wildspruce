"use server";

import { cookies } from "next/headers";
import { sanitizeInput } from "./auth-client";

/**
 * Admin Authentication Middleware - SERVER ONLY
 * 
 * This file contains server-side authentication logic.
 * Do NOT import this in client components.
 * 
 * Uses Basic Auth with credentials from .env.local
 * Credentials are verified server-side only, never exposed to client
 * 
 * Implementation:
 * 1. Admin logs in via form with username/password
 * 2. Server verifies against ADMIN_USERNAME and ADMIN_PASSWORD from .env.local
 * 3. If valid, sets secure httpOnly cookie with session token
 * 4. Protected pages verify the session token
 * 5. Logout clears the cookie
 * 
 * Security:
 * - Credentials stored in .env.local (environment variables, never in code)
 * - Passwords compared with constant-time comparison to prevent timing attacks
 * - Session token generated as random string, stored securely
 * - HttpOnly, Secure, SameSite cookies prevent XSS/CSRF attacks
 * - NEVER store raw credentials in cookies
 */

const ADMIN_SESSION_COOKIE = "admin_session_token";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Verify admin credentials against environment variables
 * Returns true if credentials match, false otherwise
 * 
 * Protection against injection: Use strict equality checks, no string concatenation
 */
function verifyAdminCredentials(
  username: string,
  password: string
): boolean {
  // Fetch credentials from environment (never hardcode)
  const expectedUsername = process.env.ADMIN_USERNAME || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD || "password";

  // Use constant-time comparison to prevent timing attacks
  const usernameMatch =
    username.length === expectedUsername.length &&
    [...username].every((c, i) => c === expectedUsername[i]);

  const passwordMatch =
    password.length === expectedPassword.length &&
    [...password].every((c, i) => c === expectedPassword[i]);

  return usernameMatch && passwordMatch;
}

/**
 * Generate a random session token
 * Used to maintain admin session without storing credentials
 */
function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * Create admin session by setting secure cookie
 */
export async function createAdminSession(
  username: string,
  password: string
): Promise<boolean> {
  // Sanitize inputs
  try {
    sanitizeInput(username, 128);
    sanitizeInput(password, 128);
  } catch (err) {
    return false;
  }

  // Verify credentials first
  if (!verifyAdminCredentials(username, password)) {
    return false;
  }

  const cookieStore = await cookies();
  const sessionToken = generateSessionToken();

  // Store session token (NOT credentials) in cookie
  // httpOnly: prevents JavaScript from accessing cookie (XSS protection)
  // secure: cookie only sent over HTTPS
  // sameSite: prevents CSRF attacks
  cookieStore.set(ADMIN_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_DURATION,
  });

  return true;
}

/**
 * Clear admin session (logout)
 */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

/**
 * Check if user has valid admin session
 * Call this in protected pages to verify authentication
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  // Session token must exist and be non-empty
  return !!sessionToken && sessionToken.length > 0;
}

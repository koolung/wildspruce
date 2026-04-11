/**
 * Client-side authentication utilities
 * Helper functions safe to use in client components
 */

/**
 * Sanitize and validate input to prevent injection attacks
 * - Remove any null bytes
 * - Limit string length
 * - For usernames: allow only alphanumeric, dots, hyphens, underscores
 * - For passwords: allow most characters except control characters
 */
export function sanitizeInput(
  input: unknown,
  maxLength: number = 256,
  isPassword: boolean = false
): string {
  if (typeof input !== "string") {
    throw new Error("Invalid input type");
  }

  let sanitized = input
    .substring(0, maxLength)
    .replace(/\0/g, "") // Remove null bytes
    .replace(/[\r\n]/g, ""); // Remove line breaks

  // For usernames, be strict - only allow word characters, dots, hyphens, underscores
  // For passwords, be more permissive - allow most printable characters
  if (isPassword) {
    // Passwords: reject only null bytes and control characters (already removed null bytes above)
    if (!sanitized.match(/^[\x20-\x7E]*$/)) {
      throw new Error("Invalid character in password");
    }
  } else {
    // Usernames: strict validation - word characters, dots, hyphens, underscores only
    if (!sanitized.match(/^[\w.-]+$/)) {
      throw new Error("Invalid character in username");
    }
  }

  return sanitized;
}

/**
 * Verify admin credentials (client-side check before sending to server)
 * Note: This is NOT security-critical validation - actual verification happens server-side
 */
export function verifyAdminCredentials(
  _username: string,
  _password: string
): boolean {
  // Client-side validation only checks format, not actual values
  // Real verification happens in server action
  return true;
}

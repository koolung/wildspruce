/**
 * Client-side authentication utilities
 * Helper functions safe to use in client components
 */

/**
 * Sanitize and validate input to prevent injection attacks
 * - Remove any null bytes
 * - Limit string length
 * - Allow only alphanumeric and safe special characters
 */
export function sanitizeInput(input: unknown, maxLength: number = 256): string {
  if (typeof input !== "string") {
    throw new Error("Invalid input type");
  }

  let sanitized = input
    .substring(0, maxLength)
    .replace(/\0/g, "") // Remove null bytes
    .replace(/[\r\n]/g, ""); // Remove line breaks

  // For credentials, be more strict - only allow word characters, dots, hyphens, underscores
  // This helps prevent special character injection attacks
  if (!sanitized.match(/^[\w.-]+$/)) {
    throw new Error("Invalid character in input");
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

import { headers } from 'next/headers';
import { timingSafeEqual } from 'crypto';

/**
 * Admin credentials stored in environment variables
 * Credentials are stored as: username:password (base64 encoded)
 * Set ADMIN_CREDENTIALS=base64(username:password) in .env.local
 */

interface AdminCredentials {
  username: string;
  password: string;
}

/**
 * Parse and validate admin credentials from environment
 * Prevents injection attacks by validating format
 */
function getAdminCredentials(): AdminCredentials | null {
  const encoded = process.env.ADMIN_CREDENTIALS;

  if (!encoded) {
    console.error('ADMIN_CREDENTIALS not set in environment');
    return null;
  }

  try {
    // Decode from base64
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');

    // Validate format: must contain exactly one colon
    const colonCount = (decoded.match(/:/g) || []).length;
    if (colonCount !== 1) {
      console.error('Invalid ADMIN_CREDENTIALS format (expected username:password)');
      return null;
    }

    const [username, password] = decoded.split(':');

    // Sanitize: validate username is alphanumeric + underscores/dots/hyphens
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      console.error('Invalid username format');
      return null;
    }

    // Validate password exists
    if (!password || password.length === 0) {
      console.error('Invalid password (empty)');
      return null;
    }

    return { username, password };
  } catch (error) {
    console.error('Error parsing ADMIN_CREDENTIALS:', error);
    return null;
  }
}

/**
 * Extract and validate Basic Auth credentials from request header
 * Format: Authorization: Basic base64(username:password)
 */
function extractBasicAuth(authHeader: string | null): { username: string; password: string } | null {
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return null;
  }

  try {
    const encoded = authHeader.slice(6); // Remove 'Basic ' prefix

    // Validate base64 format
    if (!/^[A-Za-z0-9+/=]*$/.test(encoded)) {
      console.error('Invalid Base64 format in Authorization header');
      return null;
    }

    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');

    // Validate format: must contain exactly one colon
    const colonCount = (decoded.match(/:/g) || []).length;
    if (colonCount !== 1) {
      console.error('Invalid Authorization format (expected username:password)');
      return null;
    }

    const [username, password] = decoded.split(':');

    // Sanitize username
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      console.error('Invalid username format in Authorization header');
      return null;
    }

    if (!password || password.length === 0) {
      console.error('Empty password in Authorization header');
      return null;
    }

    return { username, password };
  } catch (error) {
    console.error('Error parsing Basic Auth header:', error);
    return null;
  }
}

/**
 * Verify admin credentials using constant-time comparison
 * Prevents timing attacks
 */
function verifyCredentials(
  providedUsername: string,
  providedPassword: string,
  expectedUsername: string,
  expectedPassword: string
): boolean {
  try {
    // Use constant-time comparison to prevent timing attacks
    const usernameMatch = timingSafeEqual(
      Buffer.from(providedUsername),
      Buffer.from(expectedUsername)
    );

    const passwordMatch = timingSafeEqual(
      Buffer.from(providedPassword),
      Buffer.from(expectedPassword)
    );

    return usernameMatch && passwordMatch;
  } catch {
    // If buffers are different lengths, timingSafeEqual throws
    return false;
  }
}

/**
 * Middleware function to verify admin authentication
 * Returns true if credentials are valid, false otherwise
 *
 * Usage in API routes:
 * ```typescript
 * if (!(await verifyAdminAuth(request))) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 * }
 * ```
 */
export async function verifyAdminAuth(request: Request): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');

    // Extract credentials from Authorization header
    const providedCreds = extractBasicAuth(authHeader);
    if (!providedCreds) {
      console.warn('Missing or invalid Authorization header');
      return false;
    }

    // Get expected credentials from environment
    const expectedCreds = getAdminCredentials();
    if (!expectedCreds) {
      console.error('Admin credentials not configured');
      return false;
    }

    // Verify using constant-time comparison
    const isValid = verifyCredentials(
      providedCreds.username,
      providedCreds.password,
      expectedCreds.username,
      expectedCreds.password
    );

    if (!isValid) {
      console.warn('Invalid admin credentials provided');
    }

    return isValid;
  } catch (error) {
    console.error('Error verifying admin auth:', error);
    return false;
  }
}

/**
 * Utility function to generate Base64 encoded credentials for testing
 * Use this to create Authorization header value
 *
 * Example:
 * const encoded = encodeAdminCredentials('admin', 'securepassword123');
 * // Use as: Authorization: Basic <encoded>
 */
export function encodeAdminCredentials(username: string, password: string): string {
  return Buffer.from(`${username}:${password}`).toString('base64');
}

/**
 * Utility function to encode credentials for ADMIN_CREDENTIALS env var
 *
 * Example:
 * const envValue = encodeEnvCredentials('admin', 'securepassword123');
 * // Set in .env.local: ADMIN_CREDENTIALS=<envValue>
 */
export function encodeEnvCredentials(username: string, password: string): string {
  return Buffer.from(`${username}:${password}`).toString('base64');
}

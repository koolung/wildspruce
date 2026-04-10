/**
 * In-memory rate limiter for protecting against brute force attacks
 * For production, consider using Redis for distributed rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

const REQUESTS_LIMIT = parseInt(process.env.RATE_LIMIT_REQUESTS || '5', 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);

/**
 * Check if a request should be allowed based on rate limit
 * @param identifier - Unique identifier (IP, email, etc.)
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = store.get(identifier);

  // If no entry exists or the window has expired, create a new one
  if (!entry || now >= entry.resetTime) {
    store.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return true;
  }

  // Check if limit exceeded
  if (entry.count >= REQUESTS_LIMIT) {
    return false;
  }

  // Increment counter
  entry.count++;
  return true;
}

/**
 * Get remaining requests for identifier
 */
export function getRemainingRequests(identifier: string): number {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now >= entry.resetTime) {
    return REQUESTS_LIMIT;
  }

  return Math.max(0, REQUESTS_LIMIT - entry.count);
}

/**
 * Reset rate limit for identifier (for admin use)
 */
export function resetRateLimit(identifier: string): void {
  store.delete(identifier);
}

/**
 * Clean up expired entries to prevent memory leaks
 * Call periodically (e.g., every 10 minutes)
 */
export function cleanupExpiredEntries(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of store.entries()) {
    if (now >= entry.resetTime) {
      store.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}

// Cleanup expired entries every 10 minutes
setInterval(() => {
  const cleaned = cleanupExpiredEntries();
  if (cleaned > 0) {
    console.log(`[Rate Limiter] Cleaned up ${cleaned} expired entries`);
  }
}, 10 * 60 * 1000);

/**
 * Get client identifier from request
 * In production, use headers['x-forwarded-for'] for proxy/cloud environments
 */
export function getClientIdentifier(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
  return ip;
}

/**
 * Simple in-memory rate limiter for authentication routes
 * For production, consider using Redis-backed solution like @upstash/ratelimit
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP address, user ID, email, etc.)
 * @param config - Rate limit configuration
 * @returns Result indicating if request is allowed
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  
  let entry = store.get(key);
  
  // Create new entry if doesn't exist or window expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    store.set(key, entry);
    
    return {
      success: true,
      remaining: config.limit - 1,
      resetAt: entry.resetAt,
    };
  }
  
  // Increment count
  entry.count++;
  
  // Check if limit exceeded
  if (entry.count > config.limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }
  
  return {
    success: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get client IP from request headers
 * Checks various headers commonly set by proxies and load balancers
 */
export function getClientIp(request: Request): string {
  // Check various headers in order of priority
  const headers = request.headers;
  
  // Cloudflare
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;
  
  // Standard forwarded header
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // Take the first IP if there are multiple
    return xForwardedFor.split(",")[0].trim();
  }
  
  // Other common headers
  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp;
  
  // Fallback to unknown
  return "unknown";
}

// Preset rate limit configurations
export const RATE_LIMITS = {
  /** 5 login attempts per 15 minutes per IP */
  LOGIN: {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  },
  /** 3 registration attempts per hour per IP */
  REGISTER: {
    limit: 3,
    windowMs: 60 * 60 * 1000,
  },
  /** 3 password reset requests per hour per email */
  PASSWORD_RESET: {
    limit: 3,
    windowMs: 60 * 60 * 1000,
  },
  /** 10 general API requests per minute per user */
  API_GENERAL: {
    limit: 60,
    windowMs: 60 * 1000,
  },
} as const;

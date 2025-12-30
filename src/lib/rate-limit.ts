/**
 * Simple in-memory rate limiter for API routes
 * For production at scale, replace with Redis-based solution
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

interface IdempotencyEntry {
  response: unknown
  timestamp: number
}

// In-memory stores (replace with Redis in production for multi-instance deployments)
const rateLimitStore = new Map<string, RateLimitEntry>()
const idempotencyStore = new Map<string, IdempotencyEntry>()

// Clean up old entries periodically
const CLEANUP_INTERVAL = 60 * 1000 // 1 minute
const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000 // 24 hours

let cleanupScheduled = false

function scheduleCleanup() {
  if (cleanupScheduled) return
  cleanupScheduled = true

  setInterval(() => {
    const now = Date.now()

    // Clean rate limit entries
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key)
      }
    }

    // Clean idempotency entries
    for (const [key, entry] of idempotencyStore.entries()) {
      if (now - entry.timestamp > IDEMPOTENCY_TTL) {
        idempotencyStore.delete(key)
      }
    }
  }, CLEANUP_INTERVAL)
}

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

/**
 * Check rate limit for a given identifier (e.g., IP address, user ID)
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60 * 1000, maxRequests: 10 }
): RateLimitResult {
  scheduleCleanup()

  const now = Date.now()
  const key = `rate:${identifier}`
  const existing = rateLimitStore.get(key)

  if (!existing || now > existing.resetTime) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    }
  }

  if (existing.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: existing.resetTime,
    }
  }

  existing.count++
  return {
    success: true,
    remaining: config.maxRequests - existing.count,
    resetTime: existing.resetTime,
  }
}

/**
 * Check if an idempotency key has been used and return cached response if so
 */
export function checkIdempotency(key: string): { duplicate: boolean; cachedResponse?: unknown } {
  scheduleCleanup()

  const existing = idempotencyStore.get(`idem:${key}`)
  if (existing) {
    return { duplicate: true, cachedResponse: existing.response }
  }
  return { duplicate: false }
}

/**
 * Store response for idempotency key
 */
export function storeIdempotencyResponse(key: string, response: unknown): void {
  idempotencyStore.set(`idem:${key}`, {
    response,
    timestamp: Date.now(),
  })
}

/**
 * Generate idempotency key from payment details
 * This ensures the same payment details always produce the same key
 */
export function generatePaymentIdempotencyKey(params: {
  schoolId: string
  studentName: string
  parentEmail: string
  amount: number
}): string {
  const data = `${params.schoolId}:${params.studentName}:${params.parentEmail}:${params.amount}:${Math.floor(Date.now() / (5 * 60 * 1000))}` // 5-minute window
  return Buffer.from(data).toString('base64')
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  return 'unknown'
}

const limits = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const existing = limits.get(key);

  if (!existing || existing.resetTime < now) {
    limits.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (existing.count >= maxRequests) {
    return false;
  }

  existing.count++;
  return true;
}

import { NextRequest } from 'next/server';

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try { return origin === new URL(request.url).origin; } catch { return false; }
}

export function hasAcceptableJsonBody(request: Request, maxBytes: number): boolean {
  const value = request.headers.get('content-length');
  if (!value) return true;
  const length = Number(value);
  return Number.isSafeInteger(length) && length >= 0 && length <= maxBytes;
}

/** Per-instance abuse backstop; deploy a shared/edge limiter for global limits. */
export function isRateLimited(request: NextRequest, scope: string, limit: number, windowMs: number): boolean {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  const key = `${scope}:${ip}`, now = Date.now(), current = buckets.get(key);
  if (!current || current.resetAt <= now) { buckets.set(key, { count: 1, resetAt: now + windowMs }); return false; }
  current.count += 1;
  return current.count > limit;
}

export function noStoreJson(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('Cache-Control', 'no-store, max-age=0');
  return Response.json(body, { ...init, headers });
}

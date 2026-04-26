import { eq } from 'drizzle-orm'
import { type H3Event, getRequestHeader, getRequestIP } from 'h3'

import { users } from '~~/database/orm/schema'

export interface RequestFootprint {
  ipAddress: string | null;
  userAgent: string | null;
  countryCode: string | null;
  city: string | null;
}

export interface MarketingAttribution {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  referrer?: string | null;
  umamiSessionId?: string | null;
}

export function captureRequestFootprint(event: H3Event): RequestFootprint {
  // 1. Extract IP Address
  // getRequestIP checks x-forwarded-for and other standard headers automatically
  const ipAddress = getRequestIP(event, { xForwardedFor: true }) || null;

  // 2. Extract User Agent
  const userAgent = getRequestHeader(event, 'user-agent') || null;

  // 3. Extract Geo-Location (from common proxy headers like Cloudflare, Vercel, etc.)
  const countryCode = 
    getRequestHeader(event, 'cf-ipcountry') || 
    getRequestHeader(event, 'x-vercel-ip-country') || 
    null;

  const city = 
    getRequestHeader(event, 'cf-ipcity') || 
    getRequestHeader(event, 'x-vercel-ip-city') || 
    null;

  return {
    ipAddress,
    userAgent,
    countryCode,
    city,
  };
}

/**
 * Resolves a userId for a request. 
 * Anchors identity to the Device ID (Fingerprint) to ensure every visitor 
 * is truly unique, even if they share the same IP (e.g. coffee shops, offices).
 */
export async function resolveUserIdentity(
  db: Awaited<ReturnType<typeof useDb>>, 
  existingUserId: string | null, 
  footprint: RequestFootprint, 
  attribution: MarketingAttribution | null
): Promise<string | null> {
  // 1. Return logged-in userId if available (Authenticated takes priority)
  if (existingUserId) return existingUserId;

  // 2. Device-First Identification
  // We prioritize the Device ID (Hardware/Browser Fingerprint).
  // This is much more unique than an IP Address.
  const deviceId = attribution?.deviceId || 'unknown';
  const ip = attribution?.ispIp || footprint.ipAddress || 'unknown';
  
  if (deviceId === 'unknown') {
    // If we can't get a device ID, fallback to IP (Better than nothing)
    const cleanIp = ip.replace(/[:.]/g, '-');
    const anonEmail = `anon-ip-${cleanIp}@fewwords.local`;
    
    const existingAnon = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, anonEmail))
      .limit(1);

    if (existingAnon.length > 0 && existingAnon[0]) return existingAnon[0].id;

    const newAnon = await db.insert(users).values({
      email: anonEmail,
      name: 'Anonymous (IP-Based)',
      emailVerified: false,
      role: 'user',
      ipAddress: ip,
      ...(attribution || {}),
      ...footprint,
    }).returning({ id: users.id });

    return newAnon[0]?.id || null;
  }

  // 3. Anchor on Device ID
  const anonEmail = `anon-dv-${deviceId}@fewwords.local`;

  // Check if this anonymous "Device-User" already exists
  const existingAnon = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, anonEmail))
    .limit(1);

  if (existingAnon.length > 0 && existingAnon[0]) {
    return existingAnon[0].id;
  }

  // Create a new "shadow" user for this unique device
  try {
    const newAnon = await db.insert(users).values({
      email: anonEmail,
      name: 'Anonymous Device',
      emailVerified: false,
      role: 'user',
      ipAddress: ip,
      userAgent: footprint.userAgent,
      ...(attribution || {}),
      ...footprint,
    }).returning({ id: users.id });

    return newAnon[0]?.id || null;
  } catch (error) {
    console.error('[Attribution] Failed to create shadow user:', error);
    return null;
  }
}

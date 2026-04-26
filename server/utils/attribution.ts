import { eq } from 'drizzle-orm'
import { type H3Event, getRequestHeader, getRequestIP } from 'h3'

import { users } from '~~/database/orm/schema'

export interface RequestFootprint {
  ipAddress: string | null;
  userAgent: string | null;
  countryCode: string | null;
  city: string | null;
  region?: string | null;
  postalCode?: string | null;
  isp?: string | null;
}

export interface MarketingAttribution {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  referrer?: string | null;
  umamiSessionId?: string | null;
  deviceId?: string | null;
  ispIp?: string | null;
}

export function captureRequestFootprint(event: H3Event): RequestFootprint {
  // 1. Extract IP Address
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

  // 4. Advanced Geo-Location (Region, Postal Code, ISP)
  // Cloudflare specific headers
  const region = getRequestHeader(event, 'cf-region') || getRequestHeader(event, 'x-vercel-ip-country-region') || null;
  const postalCode = getRequestHeader(event, 'cf-postal-code') || null;
  
  // ISP detection (sometimes provided by proxies as 'cf-as-number' or organization)
  const asn = getRequestHeader(event, 'cf-as-number') || null;
  const isp = asn ? `ASN-${asn}` : null;

  return {
    ipAddress,
    userAgent,
    countryCode,
    city,
    region,
    postalCode,
    isp,
  };
}

/**
 * Packs raw attribution and footprint data into the structure required by the database.
 * This implements the "Hybrid JSONB" approach.
 */
export function packAttributionData(footprint: RequestFootprint, attribution: MarketingAttribution | null) {
  const ip = attribution?.ispIp || footprint.ipAddress || 'unknown';
  
  return {
    ipAddress: ip,
    countryCode: footprint.countryCode,
    city: footprint.city,
    utmSource: attribution?.utmSource || null,
    attribution: {
      utmMedium: attribution?.utmMedium || null,
      utmCampaign: attribution?.utmCampaign || null,
      utmContent: attribution?.utmContent || null,
      utmTerm: attribution?.utmTerm || null,
      referrer: attribution?.referrer || null,
      umamiSessionId: attribution?.umamiSessionId || null,
      // Store expanded geo in the attribution blob
      region: footprint.region || null,
      postalCode: footprint.postalCode || null,
      isp: footprint.isp || null,
    },
    metadata: {
      deviceId: attribution?.deviceId || null,
      userAgent: footprint.userAgent || null,
    },
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
  // 1. Return logged-in userId if available
  if (existingUserId) return existingUserId;

  // 2. Device-First Identification
  const ip = attribution?.ispIp || footprint.ipAddress || 'unknown';
  const deviceId = attribution?.deviceId || 'unknown';
  
  if (deviceId === 'unknown') {
    // Fallback to IP normalization for dev/localhost
    let normalizedIp = ip;
    if (normalizedIp === '::1' || normalizedIp === '0:0:0:0:0:0:0:1') {
      normalizedIp = '127.0.0.1';
    }
    const cleanIp = normalizedIp.replace(/[:.]/g, '-');
    const anonEmail = `anon-ip-${cleanIp}@fewwords.local`;
    
    const existingAnon = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, anonEmail))
      .limit(1);

    if (existingAnon.length > 0 && existingAnon[0]) return existingAnon[0].id;

    const packed = packAttributionData(footprint, attribution);
    const newAnon = await db.insert(users).values({
      email: anonEmail,
      name: 'Anonymous (IP-Based)',
      emailVerified: false,
      role: 'user',
      ...packed,
    }).returning({ id: users.id });

    return newAnon[0]?.id || null;
  }

  // 3. Anchor on Device ID
  const anonEmail = `anon-dv-${deviceId}@fewwords.local`;

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
    const packed = packAttributionData(footprint, attribution);
    const newAnon = await db.insert(users).values({
      email: anonEmail,
      name: 'Anonymous Device',
      emailVerified: false,
      role: 'user',
      ...packed,
    }).returning({ id: users.id });

    return newAnon[0]?.id || null;
  } catch (error) {
    console.error('[Attribution] Failed to create shadow user:', error);
    return null;
  }
}

export interface MarketingAttribution {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  referrer: string | null;
  deviceId: string | null;
  ispIp: string | null;
}

const STORAGE_KEY = 'fw_marketing_attribution';

/**
 * Generates a unique "Fingerprint" for the device based on hardware/browser traits.
 * This is the closest thing to a MAC address we can get.
 */
function generateFingerprint(): string {
  if (!import.meta.client) return '';
  
  const traits = [
    navigator.userAgent,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    navigator.language,
    navigator.hardwareConcurrency || 'unknown',
  ];
  
  const str = traits.join('|');
  // Simple fast hash
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Scans the current URL and Document for attribution data
 * and stores it in sessionStorage. Call this on app load.
 */
export async function captureAndStoreAttribution() {
  if (!import.meta.client) return;

  const urlParams = new URLSearchParams(window.location.search);
  const existingStorage = sessionStorage.getItem(STORAGE_KEY);
  
  // 1. Generate or Retrieve Device ID (Stored in localStorage to survive tab closes)
  let deviceId = localStorage.getItem('fw_device_id');
  if (!deviceId) {
    deviceId = `dv-${generateFingerprint()}-${Math.random().toString(36).slice(2, 7)}`;
    localStorage.setItem('fw_device_id', deviceId);
  }

  // 2. (Optional) Fetch Public ISP IP hint for more accurate tracking during dev/proxies
  let ispIp = null;
  try {
    const ipRes = await fetch('https://api.ipify.org?format=json').then(res => res.json());
    ispIp = ipRes.ip;
  } catch {
    // Silent fail - backend will fallback to request IP
  }

  const hasUtms = urlParams.has('utm_source');

  if (hasUtms || !existingStorage) {
    const attribution: MarketingAttribution = {
      utmSource: urlParams.get('utm_source'),
      utmMedium: urlParams.get('utm_medium'),
      utmCampaign: urlParams.get('utm_campaign'),
      utmContent: urlParams.get('utm_content'),
      utmTerm: urlParams.get('utm_term'),
      referrer: document.referrer || null,
      deviceId,
      ispIp,
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  }
}

/**
 * Retrieves the stored attribution data to send with an API request.
 */
export function getStoredAttribution(): MarketingAttribution {
  if (!import.meta.client) {
    return { utmSource: null, utmMedium: null, utmCampaign: null, utmContent: null, utmTerm: null, referrer: null, deviceId: null, ispIp: null };
  }

  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as MarketingAttribution;
    } catch (e) {
      console.error('Failed to parse stored attribution data', e);
    }
  }

  // Final fallback
  return {
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmContent: null,
    utmTerm: null,
    referrer: document.referrer || null,
    deviceId: localStorage.getItem('fw_device_id'),
    ispIp: null,
  };
}


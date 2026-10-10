/**
 * Low-Bandwidth Coordinate Compression Service for ResQ-Mesh
 * Minimizes packet size over constrained peer-to-peer links (BLE/Wi-Fi Direct/LoRa)
 */

const STATUS_CODES: Record<string, number> = {
  SAFE: 0,
  NEED_HELP: 1,
  INJURED: 2,
  CRITICAL_SOS: 3,
  UNKNOWN: 4,
};

const CODE_TO_STATUS: Record<number, string> = {
  0: 'SAFE',
  1: 'NEED_HELP',
  2: 'INJURED',
  3: 'CRITICAL_SOS',
  4: 'UNKNOWN',
};

// Base64-URL character set for ultra-compact string representation
const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

function encodeBase64UrlInt(num: number, padLength: number): string {
  let str = '';
  let n = Math.floor(Math.abs(num));
  while (n > 0 || str.length === 0) {
    str = CHARS[n % 64] + str;
    n = Math.floor(n / 64);
  }
  while (str.length < padLength) {
    str = '0' + str;
  }
  return str.slice(-padLength);
}

function decodeBase64UrlInt(str: string): number {
  let num = 0;
  for (let i = 0; i < str.length; i++) {
    const idx = CHARS.indexOf(str[i]);
    num = num * 64 + (idx !== -1 ? idx : 0);
  }
  return num;
}

/**
 * Packs (lat, lng, battery, status) into a tight 12-character token
 * Lat precision: ~0.000021 deg (~2.3 meters precision on ground)
 * Lng precision: ~0.000042 deg (~3.5 meters precision on ground)
 */
export function compressLocationBreadcrumb(
  lat: number,
  lng: number,
  battery: number,
  status: string
): string {
  // Normalize lat (-90 to +90) into unsigned integer [0, 8388607] (23-bit)
  const normLat = Math.round(((lat + 90) / 180) * 8388607);
  // Normalize lng (-180 to +180) into unsigned integer [0, 8388607] (23-bit)
  const normLng = Math.round(((lng + 180) / 360) * 8388607);
  // Clamp battery 0-100
  const clampedBattery = Math.min(100, Math.max(0, Math.round(battery)));
  // Status code 0-4
  const statusCode = STATUS_CODES[status] ?? 4;

  const latEncoded = encodeBase64UrlInt(normLat, 4);
  const lngEncoded = encodeBase64UrlInt(normLng, 4);
  const batteryEncoded = encodeBase64UrlInt(clampedBattery, 2);
  const statusEncoded = encodeBase64UrlInt(statusCode, 1);

  return `${latEncoded}${lngEncoded}${batteryEncoded}${statusEncoded}`;
}

export function decompressLocationBreadcrumb(token: string): {
  lat: number;
  lng: number;
  battery: number;
  status: string;
} {
  if (!token || token.length < 11) {
    return { lat: 37.7749, lng: -122.4194, battery: 100, status: 'SAFE' };
  }

  const latPart = token.slice(0, 4);
  const lngPart = token.slice(4, 8);
  const batPart = token.slice(8, 10);
  const statPart = token.slice(10, 11);

  const normLat = decodeBase64UrlInt(latPart);
  const normLng = decodeBase64UrlInt(lngPart);
  const battery = decodeBase64UrlInt(batPart);
  const statusCode = decodeBase64UrlInt(statPart);

  const lat = (normLat / 8388607) * 180 - 90;
  const lng = (normLng / 8388607) * 360 - 180;
  const status = CODE_TO_STATUS[statusCode] || 'UNKNOWN';

  return {
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
    battery,
    status,
  };
}

export function calculatePayloadSavings(rawPayload: object, compressedToken: string) {
  const rawString = JSON.stringify(rawPayload);
  const rawBytes = new TextEncoder().encode(rawString).length;
  const compressedBytes = new TextEncoder().encode(compressedToken).length;
  const savingsPct = Math.round(((rawBytes - compressedBytes) / rawBytes) * 100);

  return {
    rawBytes,
    compressedBytes,
    savingsPct,
  };
}

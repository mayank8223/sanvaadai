/**
 * T25 – Maps provider constants for submission location preview.
 * Supports Google Maps and Mapbox via env vars.
 */

export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
export const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

export const MAP_PROVIDER = GOOGLE_MAPS_API_KEY
  ? 'google'
  : MAPBOX_ACCESS_TOKEN
    ? 'mapbox'
    : 'none';

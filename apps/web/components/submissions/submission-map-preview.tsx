'use client';

/* ----------------- Globals --------------- */
import Image from 'next/image';

import { MAP_PROVIDER, GOOGLE_MAPS_API_KEY, MAPBOX_ACCESS_TOKEN } from '@/lib/maps/constants';

/* ----------------- Types --------------- */
type GpsLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
};

type SubmissionMapPreviewProps = {
  location: GpsLocation;
  /** Width in pixels for static map image. */
  width?: number;
  /** Height in pixels for static map image. */
  height?: number;
  /** Map zoom level (1–20). */
  zoom?: number;
  /** Alt text for accessibility. */
  alt?: string;
};

/* ----------------- Constants --------------- */
const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 400;
const DEFAULT_ZOOM = 15;

const getGoogleStaticMapUrl = (
  lat: number,
  lng: number,
  width: number,
  height: number,
  zoom: number
): string => {
  const base = 'https://maps.googleapis.com/maps/api/staticmap';
  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: String(zoom),
    size: `${width}x${height}`,
    maptype: 'roadmap',
    key: GOOGLE_MAPS_API_KEY,
  });
  return `${base}?${params.toString()}`;
};

const getMapboxStaticMapUrl = (
  lat: number,
  lng: number,
  width: number,
  height: number,
  zoom: number
): string => {
  const base = 'https://api.mapbox.com/styles/v1/mapbox/streets-v12/static';
  const marker = `pin-s+ff0000(${lng},${lat})`;
  const params = new URLSearchParams({
    access_token: MAPBOX_ACCESS_TOKEN,
    width: String(width),
    height: String(height),
    zoom: String(zoom),
  });
  return `${base}/${marker}/${lng},${lat},${zoom}/0/0?${params.toString()}`;
};

const getGoogleMapsLink = (lat: number, lng: number): string =>
  `https://www.google.com/maps?q=${lat},${lng}`;

/* ----------------- Component --------------- */
export const SubmissionMapPreview = ({
  location,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  zoom = DEFAULT_ZOOM,
  alt = 'Submission location on map',
}: SubmissionMapPreviewProps) => {
  const { latitude, longitude } = location;

  if (MAP_PROVIDER === 'google' && GOOGLE_MAPS_API_KEY) {
    const src = getGoogleStaticMapUrl(latitude, longitude, width, height, zoom);
    return (
      <a
        href={getGoogleMapsLink(latitude, longitude)}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-lg border bg-muted"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="h-auto w-full object-cover"
          unoptimized
        />
      </a>
    );
  }

  if (MAP_PROVIDER === 'mapbox' && MAPBOX_ACCESS_TOKEN) {
    const src = getMapboxStaticMapUrl(latitude, longitude, width, height, zoom);
    return (
      <a
        href={getGoogleMapsLink(latitude, longitude)}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-lg border bg-muted"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="h-auto w-full object-cover"
          unoptimized
        />
      </a>
    );
  }

  return (
    <a
      href={getGoogleMapsLink(latitude, longitude)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-[200px] items-center justify-center rounded-lg border bg-muted p-6 text-center"
    >
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
        <p className="text-sm font-medium text-primary underline underline-offset-2">
          Open in Google Maps →
        </p>
      </div>
    </a>
  );
};

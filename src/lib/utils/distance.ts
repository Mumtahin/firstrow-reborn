const EARTH_RADIUS_MILES = 3958.8

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/** Returns the distance in miles between two lat/lng points using the Haversine formula. */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_MILES * c
}

/** Formats a distance in miles to a human-readable string. */
export function formatDistance(miles: number): string {
  if (miles < 0.1) return '< 0.1 mi'
  if (miles < 10) return `${miles.toFixed(1)} mi`
  return `${Math.round(miles)} mi`
}

/** Returns the Tailwind colour class for a distance badge. */
export function distanceColour(miles: number): string {
  if (miles < 1) return 'text-green-600'
  if (miles <= 2) return 'text-yellow-600'
  return 'text-red-500'
}

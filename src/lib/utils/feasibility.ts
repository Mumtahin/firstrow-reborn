export type Feasibility = 'comfortable' | 'tight' | 'too-late'

/**
 * Estimates travel time in minutes based on distance in miles.
 * ≤ 0.5 mi → walking at ~3 mph (20 min/mile)
 * > 0.5 mi → driving at ~12 mph in urban traffic (5 min/mile)
 */
export function estimateTravelMinutes(miles: number): number {
  return Math.ceil(miles <= 0.5 ? miles * 20 : miles * 5)
}

/**
 * Returns a feasibility signal for a mosque card given how many minutes
 * until jamaat and how far away the mosque is.
 *
 * Returns null when distance is unknown or jamaat is the next day
 * (no meaningful feasibility can be shown without travel info).
 *
 * Thresholds:
 *   buffer ≥ 5 min  → 'comfortable'
 *   buffer 0–4 min  → 'tight'
 *   buffer < 0      → 'too-late'
 */
export function getFeasibility(
  minutesUntil: number,
  distanceMiles: number | null,
  isNextDay: boolean
): Feasibility | null {
  if (isNextDay || distanceMiles === null) return null
  const buffer = minutesUntil - estimateTravelMinutes(distanceMiles)
  if (buffer >= 5) return 'comfortable'
  if (buffer >= 0) return 'tight'
  return 'too-late'
}

/**
 * Formats a countdown in minutes to a human-readable string.
 *
 * Examples:
 *   0   → "Starting now"
 *   1   → "in 1 min"
 *   24  → "in 24 min"
 *   60  → "in 1h"
 *   90  → "in 1h 30m"
 *   120 → "in 2h"
 */
export function formatCountdown(minutes: number): string {
  if (minutes === 0) return 'Starting now'
  if (minutes < 60) return `in ${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `in ${h}h ${m}m` : `in ${h}h`
}

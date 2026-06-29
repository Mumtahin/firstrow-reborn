import { parseTime, toUKMinutes } from './getNextJamaat'
import type { Prayer, NextJamaatResult } from './getNextJamaat'
import type { MosqueWithTimes } from '@/lib/db/queries'

export type { Prayer }

export type EnrichedMosque = MosqueWithTimes & {
  distance: number | null
  nextJamaat: NextJamaatResult | null
}

export const PRAYER_PILLS: { key: Prayer; label: string }[] = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'zuhr', label: 'Zuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isha' },
]

/** Returns the display label for a prayer pill, substituting Jummah on Fridays. */
export function getPillLabel(key: Prayer, label: string): string {
  if (key === 'zuhr' && new Date().getDay() === 5) return 'Jummah'
  return label
}

/**
 * Returns a NextJamaatResult for a specific prayer at a given mosque, or null if
 * the jamaat has already passed (with more than 10 minutes elapsed).
 */
export function getSpecificPrayerJamaat(
  mosque: MosqueWithTimes,
  prayer: Prayer,
  now: Date
): NextJamaatResult | null {
  const jamaat = mosque[`${prayer}Jamaat` as keyof MosqueWithTimes] as string | null
  if (!jamaat) return null
  const currentMinutes = toUKMinutes(now)
  const jamaatMinutes = parseTime(jamaat)
  if (jamaatMinutes >= currentMinutes) {
    return { prayer, time: jamaat, isNextDay: false, minutesUntil: jamaatMinutes - currentMinutes }
  }
  if (currentMinutes - jamaatMinutes <= 10) {
    return { prayer, time: jamaat, isNextDay: false, minutesUntil: 0, justStarted: true }
  }
  return null
}

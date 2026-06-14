export type Prayer = 'fajr' | 'zuhr' | 'asr' | 'maghrib' | 'isha'

export type NextJamaatResult = {
  prayer: Prayer
  time: string // 'HH:mm'
  isNextDay: boolean
}

export type PrayerJamaatTimes = {
  fajrJamaat?: string | null
  zuhrJamaat?: string | null
  asrJamaat?: string | null
  maghribJamaat?: string | null
  ishaJamaat?: string | null
}

/** Parses an 'HH:mm' string to minutes since midnight. */
export function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/** Returns the current time in minutes since midnight, in the UK timezone. */
export function toUKMinutes(now: Date): number {
  const ukTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now)
  return parseTime(ukTime)
}

/**
 * Returns the next upcoming jamaat given today's prayer times and the current time.
 *
 * - If the current time is at or before a jamaat time, that jamaat is returned.
 * - If all jamaats have passed, returns tomorrow's Fajr (isNextDay: true) if provided.
 * - Returns null if all jamaats have passed and tomorrowFajr is not available.
 *
 * @param prayerTimes  Today's jamaat times (any may be null/undefined if data is missing).
 * @param now          The current moment.
 * @param tomorrowFajr Fajr jamaat time for the following day ('HH:mm'), if available.
 */
export function getNextJamaat(
  prayerTimes: PrayerJamaatTimes,
  now: Date,
  tomorrowFajr?: string | null
): NextJamaatResult | null {
  const currentMinutes = toUKMinutes(now)

  const prayers: Array<{ prayer: Prayer; jamaat: string | null | undefined }> = [
    { prayer: 'fajr', jamaat: prayerTimes.fajrJamaat },
    { prayer: 'zuhr', jamaat: prayerTimes.zuhrJamaat },
    { prayer: 'asr', jamaat: prayerTimes.asrJamaat },
    { prayer: 'maghrib', jamaat: prayerTimes.maghribJamaat },
    { prayer: 'isha', jamaat: prayerTimes.ishaJamaat },
  ]

  for (const { prayer, jamaat } of prayers) {
    if (!jamaat) continue
    // >= so that "right now" still shows the current jamaat rather than skipping it
    if (parseTime(jamaat) >= currentMinutes) {
      return { prayer, time: jamaat, isNextDay: false }
    }
  }

  // All today's jamaats have passed — next up is tomorrow's Fajr
  if (tomorrowFajr) {
    return { prayer: 'fajr', time: tomorrowFajr, isNextDay: true }
  }

  return null
}

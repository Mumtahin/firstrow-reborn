import { describe, expect, it } from 'vitest'
import { getNextJamaat, parseTime } from './getNextJamaat'

// Helpers
//
// All tests use dates in June (BST, UTC+1) so UK time = UTC + 1 hour.
// To get UK time 13:30, pass a Date of 2026-06-14T12:30:00Z.
function ukTime(hhmm: string): Date {
  const [hh, mm] = hhmm.split(':').map(Number)
  // Subtract 1 hour to convert BST → UTC
  return new Date(Date.UTC(2026, 5, 14, hh - 1, mm, 0))
}

const TIMES = {
  fajrJamaat: '04:15',   // 255 min
  zuhrJamaat: '13:30',   // 810 min
  asrJamaat: '18:45',    // 1125 min
  maghribJamaat: '21:19', // 1279 min
  ishaJamaat: '22:30',   // 1350 min
}

// parseTime
describe('parseTime', () => {
  it('parses midnight', () => expect(parseTime('00:00')).toBe(0))
  it('parses noon', () => expect(parseTime('12:00')).toBe(720))
  it('parses arbitrary time', () => expect(parseTime('13:30')).toBe(810))
  it('parses end of day', () => expect(parseTime('23:59')).toBe(1439))
})

// getNextJamaat — normal flow through the day
describe('getNextJamaat', () => {
  it('returns Fajr before Fajr time', () => {
    // now=02:00 (120), fajr=04:15 (255) → minutesUntil=135
    const result = getNextJamaat(TIMES, ukTime('02:00'))
    expect(result).toEqual({ prayer: 'fajr', time: '04:15', isNextDay: false, minutesUntil: 135 })
  })

  it('returns Fajr exactly at Fajr time', () => {
    // now=04:15 (255), fajr=04:15 (255) → minutesUntil=0
    const result = getNextJamaat(TIMES, ukTime('04:15'))
    expect(result).toEqual({ prayer: 'fajr', time: '04:15', isNextDay: false, minutesUntil: 0 })
  })

  it('returns Zuhr after Fajr has passed', () => {
    // now=10:00 (600), zuhr=13:30 (810) → minutesUntil=210
    const result = getNextJamaat(TIMES, ukTime('10:00'))
    expect(result).toEqual({ prayer: 'zuhr', time: '13:30', isNextDay: false, minutesUntil: 210 })
  })

  it('returns Zuhr exactly at Zuhr time', () => {
    // now=13:30 (810), zuhr=13:30 (810) → minutesUntil=0
    const result = getNextJamaat(TIMES, ukTime('13:30'))
    expect(result).toEqual({ prayer: 'zuhr', time: '13:30', isNextDay: false, minutesUntil: 0 })
  })

  it('returns Asr after Zuhr has passed', () => {
    // now=14:00 (840), asr=18:45 (1125) → minutesUntil=285
    const result = getNextJamaat(TIMES, ukTime('14:00'))
    expect(result).toEqual({ prayer: 'asr', time: '18:45', isNextDay: false, minutesUntil: 285 })
  })

  it('returns Maghrib after Asr has passed', () => {
    // now=19:00 (1140), maghrib=21:19 (1279) → minutesUntil=139
    const result = getNextJamaat(TIMES, ukTime('19:00'))
    expect(result).toEqual({ prayer: 'maghrib', time: '21:19', isNextDay: false, minutesUntil: 139 })
  })

  it('returns Isha after Maghrib has passed', () => {
    // now=21:30 (1290), isha=22:30 (1350) → minutesUntil=60
    const result = getNextJamaat(TIMES, ukTime('21:30'))
    expect(result).toEqual({ prayer: 'isha', time: '22:30', isNextDay: false, minutesUntil: 60 })
  })

  // After Isha edge case
  it('returns next day Fajr after Isha has passed', () => {
    // now=23:00 (1380), tomorrowFajr=04:10 (250) → minutesUntil=(1440-1380)+250=310
    const result = getNextJamaat(TIMES, ukTime('23:00'), '04:10')
    expect(result).toEqual({ prayer: 'fajr', time: '04:10', isNextDay: true, minutesUntil: 310 })
  })

  it('returns null after Isha with no tomorrow Fajr provided', () => {
    const result = getNextJamaat(TIMES, ukTime('23:00'))
    expect(result).toBeNull()
  })

  it('returns null after Isha with null tomorrow Fajr', () => {
    const result = getNextJamaat(TIMES, ukTime('23:00'), null)
    expect(result).toBeNull()
  })

  // Missing data
  it('skips prayers with missing jamaat times', () => {
    const partialTimes = {
      fajrJamaat: null,
      zuhrJamaat: null,
      asrJamaat: '18:45',
      maghribJamaat: '21:19',
      ishaJamaat: '22:30',
    }
    // now=10:00 (600), asr=18:45 (1125) → minutesUntil=525
    const result = getNextJamaat(partialTimes, ukTime('10:00'))
    expect(result).toEqual({ prayer: 'asr', time: '18:45', isNextDay: false, minutesUntil: 525 })
  })

  it('returns null when all times are missing', () => {
    const result = getNextJamaat({}, ukTime('10:00'))
    expect(result).toBeNull()
  })

  it('returns tomorrow Fajr when all times are missing but tomorrowFajr is provided', () => {
    // now=10:00 (600), tomorrowFajr=04:10 (250) → minutesUntil=(1440-600)+250=1090
    const result = getNextJamaat({}, ukTime('10:00'), '04:10')
    expect(result).toEqual({ prayer: 'fajr', time: '04:10', isNextDay: true, minutesUntil: 1090 })
  })

  // 1 minute after a jamaat — confirm it's skipped
  it('skips Fajr 1 minute after its jamaat', () => {
    // now=04:16 (256), zuhr=13:30 (810) → minutesUntil=554
    const result = getNextJamaat(TIMES, ukTime('04:16'))
    expect(result).toEqual({ prayer: 'zuhr', time: '13:30', isNextDay: false, minutesUntil: 554 })
  })

  it('skips Isha 1 minute after its jamaat', () => {
    // now=22:31 (1351), tomorrowFajr=04:10 (250) → minutesUntil=(1440-1351)+250=339
    const result = getNextJamaat(TIMES, ukTime('22:31'), '04:10')
    expect(result).toEqual({ prayer: 'fajr', time: '04:10', isNextDay: true, minutesUntil: 339 })
  })
})

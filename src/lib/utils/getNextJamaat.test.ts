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
  fajrJamaat: '04:15',
  zuhrJamaat: '13:30',
  asrJamaat: '18:45',
  maghribJamaat: '21:19',
  ishaJamaat: '22:30',
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
    const result = getNextJamaat(TIMES, ukTime('02:00'))
    expect(result).toEqual({ prayer: 'fajr', time: '04:15', isNextDay: false })
  })

  it('returns Fajr exactly at Fajr time', () => {
    const result = getNextJamaat(TIMES, ukTime('04:15'))
    expect(result).toEqual({ prayer: 'fajr', time: '04:15', isNextDay: false })
  })

  it('returns Zuhr after Fajr has passed', () => {
    const result = getNextJamaat(TIMES, ukTime('10:00'))
    expect(result).toEqual({ prayer: 'zuhr', time: '13:30', isNextDay: false })
  })

  it('returns Zuhr exactly at Zuhr time', () => {
    const result = getNextJamaat(TIMES, ukTime('13:30'))
    expect(result).toEqual({ prayer: 'zuhr', time: '13:30', isNextDay: false })
  })

  it('returns Asr after Zuhr has passed', () => {
    const result = getNextJamaat(TIMES, ukTime('14:00'))
    expect(result).toEqual({ prayer: 'asr', time: '18:45', isNextDay: false })
  })

  it('returns Maghrib after Asr has passed', () => {
    const result = getNextJamaat(TIMES, ukTime('19:00'))
    expect(result).toEqual({ prayer: 'maghrib', time: '21:19', isNextDay: false })
  })

  it('returns Isha after Maghrib has passed', () => {
    const result = getNextJamaat(TIMES, ukTime('21:30'))
    expect(result).toEqual({ prayer: 'isha', time: '22:30', isNextDay: false })
  })

  // After Isha edge case
  it('returns next day Fajr after Isha has passed', () => {
    const result = getNextJamaat(TIMES, ukTime('23:00'), '04:10')
    expect(result).toEqual({ prayer: 'fajr', time: '04:10', isNextDay: true })
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
    // Before Asr — should skip Fajr and Zuhr and return Asr
    const result = getNextJamaat(partialTimes, ukTime('10:00'))
    expect(result).toEqual({ prayer: 'asr', time: '18:45', isNextDay: false })
  })

  it('returns null when all times are missing', () => {
    const result = getNextJamaat({}, ukTime('10:00'))
    expect(result).toBeNull()
  })

  it('returns tomorrow Fajr when all times are missing but tomorrowFajr is provided', () => {
    const result = getNextJamaat({}, ukTime('10:00'), '04:10')
    expect(result).toEqual({ prayer: 'fajr', time: '04:10', isNextDay: true })
  })

  // 1 minute after a jamaat — confirm it's skipped
  it('skips Fajr 1 minute after its jamaat', () => {
    const result = getNextJamaat(TIMES, ukTime('04:16'))
    expect(result).toEqual({ prayer: 'zuhr', time: '13:30', isNextDay: false })
  })

  it('skips Isha 1 minute after its jamaat', () => {
    const result = getNextJamaat(TIMES, ukTime('22:31'), '04:10')
    expect(result).toEqual({ prayer: 'fajr', time: '04:10', isNextDay: true })
  })
})

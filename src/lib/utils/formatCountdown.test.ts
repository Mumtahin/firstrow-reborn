import { describe, expect, it } from 'vitest'
import { formatCountdown } from './formatCountdown'

describe('formatCountdown', () => {
  // Boundary: zero
  it('returns "Starting now" for 0 minutes', () => {
    expect(formatCountdown(0)).toBe('Starting now')
  })

  // Sub-hour
  it('returns "in 1 min" for 1 minute', () => {
    expect(formatCountdown(1)).toBe('in 1 min')
  })

  it('returns "in 24 min" for 24 minutes', () => {
    expect(formatCountdown(24)).toBe('in 24 min')
  })

  it('returns "in 59 min" for 59 minutes', () => {
    expect(formatCountdown(59)).toBe('in 59 min')
  })

  // Boundary: exactly one hour
  it('returns "in 1h" for exactly 60 minutes', () => {
    expect(formatCountdown(60)).toBe('in 1h')
  })

  // Over an hour with remainder
  it('returns "in 1h 1m" for 61 minutes', () => {
    expect(formatCountdown(61)).toBe('in 1h 1m')
  })

  it('returns "in 1h 30m" for 90 minutes', () => {
    expect(formatCountdown(90)).toBe('in 1h 30m')
  })

  // Boundary: exactly two hours
  it('returns "in 2h" for exactly 120 minutes', () => {
    expect(formatCountdown(120)).toBe('in 2h')
  })

  it('returns "in 2h 15m" for 135 minutes', () => {
    expect(formatCountdown(135)).toBe('in 2h 15m')
  })

  // Overnight countdown (tomorrow Fajr ~5h away)
  it('returns "in 5h 10m" for 310 minutes', () => {
    expect(formatCountdown(310)).toBe('in 5h 10m')
  })

  it('returns "in 18h" for exactly 1080 minutes', () => {
    expect(formatCountdown(1080)).toBe('in 18h')
  })
})

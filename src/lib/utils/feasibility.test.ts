import { describe, expect, it } from 'vitest'
import { estimateTravelMinutes, getFeasibility } from './feasibility'

describe('estimateTravelMinutes', () => {
  // Walking threshold: ≤ 0.5 mi at 20 min/mile
  it('estimates walking time for 0.1 mi', () => {
    expect(estimateTravelMinutes(0.1)).toBe(2) // 0.1 * 20 = 2
  })

  it('estimates walking time for 0.5 mi (boundary)', () => {
    expect(estimateTravelMinutes(0.5)).toBe(10) // 0.5 * 20 = 10
  })

  // Driving threshold: > 0.5 mi at 5 min/mile
  it('estimates driving time for 0.6 mi', () => {
    expect(estimateTravelMinutes(0.6)).toBe(3) // 0.6 * 5 = 3
  })

  it('estimates driving time for 1.0 mi', () => {
    expect(estimateTravelMinutes(1.0)).toBe(5)
  })

  it('estimates driving time for 2.5 mi', () => {
    expect(estimateTravelMinutes(2.5)).toBe(13) // 2.5 * 5 = 12.5 → ceil = 13
  })

  it('rounds up fractional minutes', () => {
    expect(estimateTravelMinutes(0.3)).toBe(6) // 0.3 * 20 = 6 (exact)
    expect(estimateTravelMinutes(0.25)).toBe(5) // 0.25 * 20 = 5 (exact)
    expect(estimateTravelMinutes(1.1)).toBe(6) // 1.1 * 5 = 5.5 → ceil = 6
  })
})

describe('getFeasibility', () => {
  // Null cases
  it('returns null when distance is unknown', () => {
    expect(getFeasibility(30, null, false)).toBeNull()
  })

  it('returns null for next-day jamaat regardless of distance', () => {
    expect(getFeasibility(300, 0.5, true)).toBeNull()
  })

  it('returns null for next-day jamaat with no distance', () => {
    expect(getFeasibility(300, null, true)).toBeNull()
  })

  // Comfortable: buffer ≥ 5 min
  // 1 mi away = 5 min drive; 20 min until = buffer of 15 → comfortable
  it('returns comfortable when buffer is well above 5 min', () => {
    expect(getFeasibility(20, 1.0, false)).toBe('comfortable')
  })

  // Exactly 5 min buffer: 10 min until, 0.5 mi = 10 min walk → buffer = 0 → tight
  // 15 min until, 0.5 mi = 10 min walk → buffer = 5 → comfortable
  it('returns comfortable when buffer is exactly 5 min', () => {
    expect(getFeasibility(15, 0.5, false)).toBe('comfortable')
  })

  // Tight: buffer 0–4 min
  // 12 min until, 0.5 mi = 10 min walk → buffer = 2 → tight
  it('returns tight when buffer is 2 min', () => {
    expect(getFeasibility(12, 0.5, false)).toBe('tight')
  })

  // Exactly 0 buffer: 10 min until, 0.5 mi = 10 min walk → buffer = 0 → tight
  it('returns tight when buffer is exactly 0', () => {
    expect(getFeasibility(10, 0.5, false)).toBe('tight')
  })

  // Too late: buffer < 0
  // 8 min until, 0.5 mi = 10 min walk → buffer = -2 → too-late
  it('returns too-late when travel time exceeds time remaining', () => {
    expect(getFeasibility(8, 0.5, false)).toBe('too-late')
  })

  it('returns too-late when jamaat has just passed (0 min until, any distance)', () => {
    expect(getFeasibility(0, 0.2, false)).toBe('too-late')
  })
})

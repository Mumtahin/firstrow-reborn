import { describe, expect, it } from 'vitest'
import { distanceColour, formatDistance, haversineDistance } from './distance'

// haversineDistance
describe('haversineDistance', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineDistance(51.5188, -0.062, 51.5188, -0.062)).toBe(0)
  })

  it('returns a positive distance for different coordinates', () => {
    const d = haversineDistance(51.5188, -0.062, 51.5283, -0.1624)
    expect(d).toBeGreaterThan(0)
  })

  it('is symmetric — A→B equals B→A', () => {
    const elm = [51.5188, -0.062] as const
    const lcm = [51.5283, -0.1624] as const
    const d1 = haversineDistance(...elm, ...lcm)
    const d2 = haversineDistance(...lcm, ...elm)
    expect(d1).toBeCloseTo(d2, 10)
  })

  it('calculates a known distance accurately — ELM to London Central Mosque (~4.4 mi)', () => {
    // East London Mosque → London Central Mosque
    const d = haversineDistance(51.5188, -0.062, 51.5283, -0.1624)
    expect(d).toBeGreaterThan(4)
    expect(d).toBeLessThan(5)
  })

  it('calculates a known distance accurately — London to Birmingham (~100 mi)', () => {
    const d = haversineDistance(51.5074, -0.1278, 52.4862, -1.8904)
    expect(d).toBeGreaterThan(95)
    expect(d).toBeLessThan(110)
  })
})

// formatDistance
describe('formatDistance', () => {
  it('formats very short distances', () => {
    expect(formatDistance(0)).toBe('< 0.1 mi')
    expect(formatDistance(0.05)).toBe('< 0.1 mi')
    expect(formatDistance(0.09)).toBe('< 0.1 mi')
  })

  it('formats sub-10-mile distances to 1 decimal place', () => {
    expect(formatDistance(0.1)).toBe('0.1 mi')
    expect(formatDistance(1.0)).toBe('1.0 mi')
    expect(formatDistance(5.56)).toBe('5.6 mi')
    expect(formatDistance(9.99)).toBe('10.0 mi')
  })

  it('formats 10+ mile distances as whole numbers', () => {
    expect(formatDistance(10)).toBe('10 mi')
    expect(formatDistance(10.4)).toBe('10 mi')
    expect(formatDistance(10.5)).toBe('11 mi')
    expect(formatDistance(100)).toBe('100 mi')
  })
})

// distanceColour
describe('distanceColour', () => {
  it('returns green under 1 mile', () => {
    expect(distanceColour(0)).toBe('text-green-600')
    expect(distanceColour(0.5)).toBe('text-green-600')
    expect(distanceColour(0.99)).toBe('text-green-600')
  })

  it('returns yellow at exactly 1 mile', () => {
    expect(distanceColour(1)).toBe('text-yellow-600')
  })

  it('returns yellow between 1 and 2 miles inclusive', () => {
    expect(distanceColour(1.5)).toBe('text-yellow-600')
    expect(distanceColour(2)).toBe('text-yellow-600')
  })

  it('returns red over 2 miles', () => {
    expect(distanceColour(2.01)).toBe('text-red-500')
    expect(distanceColour(10)).toBe('text-red-500')
  })
})

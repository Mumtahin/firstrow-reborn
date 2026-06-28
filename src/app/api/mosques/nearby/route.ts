import { NextRequest, NextResponse } from 'next/server'
import { getMosquesWithPrayerTimes } from '@/lib/db/queries'
import { haversineDistance } from '@/lib/utils/distance'

function dateString(daysFromNow: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + daysFromNow)
  return d.toISOString().split('T')[0]
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const rawLat = searchParams.get('lat')
  const rawLng = searchParams.get('lng')
  const lat = rawLat !== null ? parseFloat(rawLat) : null
  const lng = rawLng !== null ? parseFloat(rawLng) : null
  const offset = Math.max(0, parseInt(searchParams.get('offset') ?? '0', 10))
  const limit = Math.min(12, Math.max(1, parseInt(searchParams.get('limit') ?? '6', 10)))

  const hasLocation = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)

  const all = await getMosquesWithPrayerTimes(dateString(0), dateString(1))

  const sorted = hasLocation
    ? [...all].sort(
        (a, b) =>
          haversineDistance(lat, lng, a.lat, a.lng) -
          haversineDistance(lat, lng, b.lat, b.lng)
      )
    : all

  return NextResponse.json({
    items: sorted.slice(offset, offset + limit),
    hasMore: offset + limit < sorted.length,
  })
}

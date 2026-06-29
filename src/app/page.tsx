import type { Metadata } from 'next'
import Link from 'next/link'
import { getMosquesWithPrayerTimes, getFavouriteIds } from '@/lib/db/queries'
import HomeShell from '@/components/HomeShell'
import { auth } from '@/auth'

export const metadata: Metadata = {
  title: { absolute: 'Mosque Jamaat Times Near You | FirstRow' },
  description: 'Find the nearest mosque and see live jamaat times with countdowns. Updated daily for Tower Hamlets, East London and nearby areas.',
}

function dateString(daysFromNow: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + daysFromNow)
  return d.toISOString().split('T')[0]
}

export default async function HomePage() {
  const today = dateString(0)
  const tomorrow = dateString(1)

  const [mosques, session] = await Promise.all([
    getMosquesWithPrayerTimes(today, tomorrow),
    auth(),
  ])

  const userId = session?.user?.id ?? null
  const favouriteIds = userId ? Array.from(await getFavouriteIds(userId)) : []

  return (
    <main className="mx-auto w-full max-w-lg">
      <HomeShell
        mosques={mosques}
        favouriteIds={favouriteIds}
        userId={userId}
        userName={session?.user?.name ?? null}
        userImage={session?.user?.image ?? null}
      />
      <footer className="px-4 pb-8 pt-2 text-center">
        <Link
          href="/areas/tower-hamlets"
          className="text-[13px] font-medium text-text-tertiary transition-colors duration-[200ms] ease-out hover:text-text-secondary"
        >
          Browse all Tower Hamlets mosques →
        </Link>
      </footer>
    </main>
  )
}

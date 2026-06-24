import { getMosquesWithPrayerTimes, getFavouriteIds } from '@/lib/db/queries'
import HomeClient from '@/components/HomeClient'
import HomeHeader from '@/components/HomeHeader'
import { auth } from '@/auth'

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
      <HomeHeader userId={userId} userName={session?.user?.name ?? null} userImage={session?.user?.image ?? null} mosques={mosques} />
      <HomeClient mosques={mosques} favouriteIds={favouriteIds} userId={userId} />
    </main>
  )
}

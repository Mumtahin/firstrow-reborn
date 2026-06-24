import Image from 'next/image'
import { getMosquesWithPrayerTimes, getFavouriteIds } from '@/lib/db/queries'
import HomeClient from '@/components/HomeClient'
import AuthButton from '@/components/AuthButton'
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
      <div className="flex items-center justify-between px-4 pb-[14px] pt-10">
        <div className="flex items-center gap-2">
          <Image
            src="/apple-touch-icon.png"
            alt="FirstRow"
            width={28}
            height={28}
            className="rounded-lg"
          />
          <h1 className="text-[22px] font-bold tracking-[-0.01em] text-text-primary">FirstRow</h1>
        </div>
        <AuthButton />
      </div>
      <HomeClient mosques={mosques} favouriteIds={favouriteIds} userId={userId} />
    </main>
  )
}

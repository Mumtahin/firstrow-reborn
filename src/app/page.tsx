import { getMosquesWithPrayerTimes, getFavouriteIds } from '@/lib/db/queries'
import HomeClient from '@/components/HomeClient'
import AuthButton from '@/components/AuthButton'
import { auth } from '@/auth'

export default async function HomePage() {
  const today = new Date().toISOString().split('T')[0]
  const [mosques, session] = await Promise.all([
    getMosquesWithPrayerTimes(today),
    auth(),
  ])

  const userId = session?.user?.id ?? null
  const favouriteIds = userId ? Array.from(await getFavouriteIds(userId)) : []

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FirstRow</h1>
          <p className="text-sm text-gray-500">Find your next jamaat nearby</p>
        </div>
        <AuthButton />
      </div>
      <HomeClient mosques={mosques} favouriteIds={favouriteIds} userId={userId} />
    </main>
  )
}

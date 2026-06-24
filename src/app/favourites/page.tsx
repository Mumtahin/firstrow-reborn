import Link from 'next/link'
import { redirect } from 'next/navigation'
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon'
import { auth } from '@/auth'
import { getFavouritedMosques, getFavouriteIds } from '@/lib/db/queries'
import MosqueCard from '@/components/MosqueCard'
import { getNextJamaat } from '@/lib/utils/getNextJamaat'

export default async function FavouritesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const userId = session.user.id
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400_000).toISOString().split('T')[0]

  const [mosques, favouriteIds] = await Promise.all([
    getFavouritedMosques(userId, today, tomorrow),
    getFavouriteIds(userId),
  ])

  const now = new Date()

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <Link
        href="/"
        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Back
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">Favourites</h1>

      {mosques.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-10 text-center">
          <p className="text-sm font-medium text-gray-500">No favourites yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Tap the heart on any mosque to save it here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {mosques.map((m) => (
            <MosqueCard
              key={m.id}
              name={m.name}
              slug={m.slug}
              lat={m.lat}
              lng={m.lng}
              distance={null}
              nextJamaat={getNextJamaat(m, now, m.tomorrowFajrJamaat)}
              isFavourited={favouriteIds.has(m.id)}
            />
          ))}
        </div>
      )}
    </main>
  )
}

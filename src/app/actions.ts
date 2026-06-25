'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { favourite } from '@/lib/db/schema'

export async function toggleFavourite(mosqueId: number) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const userId = session.user.id

  const existing = await db
    .select()
    .from(favourite)
    .where(and(eq(favourite.userId, userId), eq(favourite.mosqueId, mosqueId)))
    .limit(1)

  if (existing.length > 0) {
    await db
      .delete(favourite)
      .where(and(eq(favourite.userId, userId), eq(favourite.mosqueId, mosqueId)))
  } else {
    await db.insert(favourite).values({ userId, mosqueId })
  }

  revalidateTag('mosques', { expire: 0 })
  revalidatePath('/favourites')
}

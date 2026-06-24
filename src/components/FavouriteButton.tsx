'use client'

import { useOptimistic, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleFavourite } from '@/app/actions'

type Props = {
  mosqueId: number
  isFavourited: boolean
  userId: string | null
}

export default function FavouriteButton({ mosqueId, isFavourited, userId }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [optimisticFav, setOptimisticFav] = useOptimistic(isFavourited)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!userId) {
      router.push('/sign-in')
      return
    }

    startTransition(async () => {
      setOptimisticFav(!optimisticFav)
      await toggleFavourite(mosqueId)
    })
  }

  return (
    <button
      onClick={handleClick}
      aria-label={optimisticFav ? 'Remove from favourites' : 'Add to favourites'}
      className="flex items-center justify-center transition hover:scale-110 active:scale-95"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill={optimisticFav ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        className={optimisticFav ? 'text-text-tertiary' : 'text-text-tertiary'}
      >
        <path d="M7.5 12.5L2.5 7.5C1.5 6.5 1.5 4.5 3 3.5C4.5 2.5 6 3 7.5 5C9 3 10.5 2.5 12 3.5C13.5 4.5 13.5 6.5 12.5 7.5L7.5 12.5Z" />
      </svg>
    </button>
  )
}

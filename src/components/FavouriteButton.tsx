'use client'

import { useOptimistic, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleFavourite } from '@/app/actions'
import StarIcon from '@/components/icons/StarIcon'

type Props = {
  mosqueId: number
  isFavourited: boolean
  userId: string | null
  className?: string
}

export default function FavouriteButton({ mosqueId, isFavourited, userId, className }: Props) {
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
      className={`flex items-center justify-center transition-transform duration-[200ms] ease-out active:scale-[0.88] ${className ?? ''}`}
    >
      <StarIcon filled={optimisticFav} className="h-[15px] w-[15px] text-text-tertiary" />
    </button>
  )
}

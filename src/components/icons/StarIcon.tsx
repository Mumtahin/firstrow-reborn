import { Star } from 'lucide-react'

export default function StarIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return <Star className={className} strokeWidth={2} fill={filled ? 'currentColor' : 'none'} />
}

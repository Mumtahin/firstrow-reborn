import { Heart } from 'lucide-react'

export default function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return <Heart className={className} strokeWidth={2} fill={filled ? 'currentColor' : 'none'} />
}

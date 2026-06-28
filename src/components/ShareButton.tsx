'use client'

type Props = {
  name: string
  className?: string
}

export default function ShareButton({ name, className }: Props) {
  async function handleClick() {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title: name, url })
      } catch {
        // user cancelled — do nothing
      }
      return
    }

    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // clipboard also unavailable — silently ignore
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Share this mosque"
      className={`flex cursor-pointer items-center justify-center transition-transform duration-[200ms] ease-out active:scale-[0.88] ${className ?? ''}`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-text-tertiary">
        <path
          d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

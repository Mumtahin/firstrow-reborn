'use client'

import { useEffect } from 'react'
import { track } from '@vercel/analytics'

export default function PwaTracker() {
  useEffect(() => {
    // Count every session launched from the home screen icon
    if (window.matchMedia('(display-mode: standalone)').matches) {
      track('pwa_session')
    }

    // Count installs — fires on Android after the user confirms,
    // and on iOS 16.4+ after "Add to Home Screen" is tapped
    const onInstalled = () => track('pwa_installed')
    window.addEventListener('appinstalled', onInstalled)
    return () => window.removeEventListener('appinstalled', onInstalled)
  }, [])

  return null
}

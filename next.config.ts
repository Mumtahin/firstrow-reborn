import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  experimental: {
    staleTimes: {
      dynamic: 300, // cache dynamic pages in the router for 5 minutes
    },
  },
}

export default nextConfig

'use client'

import dynamic from 'next/dynamic'

const MosqueDetailMap = dynamic(() => import('./MosqueDetailMap'), { ssr: false })

type Props = {
  lat: number
  lng: number
  name: string
}

export default function MosqueDetailMapClient(props: Props) {
  return <MosqueDetailMap {...props} />
}

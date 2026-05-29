'use client'

import dynamic from 'next/dynamic'

// Leaflet usa window; se carga solo en el cliente (sin SSR)
const MapaNegocios = dynamic(() => import('./MapaNegocios'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] items-center justify-center rounded-2xl border border-vecino-border bg-vecino-surface-soft text-vecino-text-muted">
      Cargando mapa...
    </div>
  ),
})

export function MapaLoader() {
  return <MapaNegocios />
}

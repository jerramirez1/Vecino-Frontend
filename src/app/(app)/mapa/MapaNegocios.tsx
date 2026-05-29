'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  buscarNegociosCercanos,
  obtenerCategoriasGeolocalizacion,
  type MarcadorNegocio,
} from '@/services/geolocalizacion.service'

// Fix de iconos por defecto de Leaflet con bundlers (Next/Turbopack)
const iconoDefecto = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})
L.Marker.prototype.options.icon = iconoDefecto

// Ubicacion de respaldo: centro de Armenia, Quindio
const ARMENIA = { lat: 4.533889, lng: -75.681389 }

type Ubicacion = { lat: number; lng: number }

// Recentra el mapa cuando cambia la ubicacion del usuario
function RecentrarMapa({ ubicacion }: { ubicacion: Ubicacion }) {
  const map = useMap()
  useEffect(() => {
    map.setView([ubicacion.lat, ubicacion.lng])
  }, [map, ubicacion.lat, ubicacion.lng])
  return null
}

export default function MapaNegocios() {
  const [ubicacion, setUbicacion] = useState<Ubicacion>(ARMENIA)
  const [usaRespaldo, setUsaRespaldo] = useState(true)
  const [negocios, setNegocios] = useState<MarcadorNegocio[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [categoria, setCategoria] = useState('')
  const [radio, setRadio] = useState(5)
  const [calificacionMin, setCalificacionMin] = useState(0)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // Pedir ubicacion del navegador al montar
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacion({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setUsaRespaldo(false)
      },
      () => {
        // Si el usuario niega el permiso, se mantiene Armenia como respaldo
        setUsaRespaldo(true)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  // Cargar categorias disponibles una vez
  useEffect(() => {
    obtenerCategoriasGeolocalizacion()
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) setCategorias(res.data)
      })
      .catch(() => {})
  }, [])

  // Buscar negocios cercanos cuando cambian ubicacion o filtros
  useEffect(() => {
    let cancelado = false
    setCargando(true)
    setError('')
    buscarNegociosCercanos({
      lat: ubicacion.lat,
      lng: ubicacion.lng,
      radio,
      categoria: categoria || undefined,
      calificacionMin: calificacionMin || undefined,
    })
      .then((res) => {
        if (cancelado) return
        if (res?.success) {
          setNegocios(res.data)
        } else {
          setError(res?.mensaje || 'No fue posible cargar los negocios cercanos')
        }
      })
      .catch((err) => {
        if (!cancelado) setError(err instanceof Error ? err.message : 'Error de red')
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })
    return () => {
      cancelado = true
    }
  }, [ubicacion.lat, ubicacion.lng, radio, categoria, calificacionMin])

  const centro = useMemo<[number, number]>(() => [ubicacion.lat, ubicacion.lng], [ubicacion])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-vecino-border bg-vecino-surface-soft p-4">
        <label className="flex flex-col text-sm text-vecino-text-muted">
          Categoria
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="mt-1 rounded-lg border border-vecino-border bg-white px-3 py-2 text-vecino-text"
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-sm text-vecino-text-muted">
          Radio: {radio} km
          <input
            type="range"
            min={1}
            max={50}
            value={radio}
            onChange={(e) => setRadio(Number(e.target.value))}
            className="mt-2 w-40"
          />
        </label>

        <label className="flex flex-col text-sm text-vecino-text-muted">
          Calificacion minima
          <select
            value={calificacionMin}
            onChange={(e) => setCalificacionMin(Number(e.target.value))}
            className="mt-1 rounded-lg border border-vecino-border bg-white px-3 py-2 text-vecino-text"
          >
            <option value={0}>Cualquiera</option>
            <option value={3}>3+ estrellas</option>
            <option value={4}>4+ estrellas</option>
            <option value={4.5}>4.5+ estrellas</option>
          </select>
        </label>

        <div className="ml-auto text-sm text-vecino-text-muted">
          {cargando ? 'Buscando...' : `${negocios.length} negocio(s) cercano(s)`}
          {usaRespaldo ? ' · usando ubicacion de Armenia' : ''}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-vecino-border" style={{ height: '70vh' }}>
        <MapContainer center={centro} zoom={14} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
          <RecentrarMapa ubicacion={ubicacion} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Circle center={centro} radius={radio * 1000} pathOptions={{ color: '#c2410c', fillOpacity: 0.05 }} />
          <Marker position={centro}>
            <Popup>Tu ubicacion</Popup>
          </Marker>

          {negocios.map((n) => (
            <Marker key={n.id} position={[n.latitud, n.longitud]}>
              <Popup>
                <strong>{n.nombre}</strong>
                <br />
                {n.categoria} · {n.direccion}
                <br />
                {n.calificacion_promedio.toFixed(1)} ★ ({n.total_resenas}) · {n.distancia_km} km
                <br />
                <a href={`/negocio/${n.id}`}>Ver negocio</a>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

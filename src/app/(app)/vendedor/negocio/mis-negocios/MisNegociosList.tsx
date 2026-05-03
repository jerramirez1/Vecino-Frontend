'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { obtenerMisNegocios } from '@/services/negocio.service'

interface Negocio {
  id: string
  nombre: string
  categoria: string
  direccion: string
  ciudad: string
  horario: string
  descripcion: string
  activo: boolean
}

export default function MisNegociosList() {
  const router = useRouter()
  const [negocios, setNegocios] = useState<Negocio[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarNegocios = async () => {
      try {
        const supabase = createSupabaseBrowserClient()
        const {
          data: { session }
        } = await supabase.auth.getSession()

        if (!session) {
          router.push('/iniciar-sesion')
          return
        }

        const resultado = await obtenerMisNegocios(session.access_token)

        if (!resultado.success) {
          setError(resultado.mensaje || 'No fue posible cargar tus negocios')
          return
        }

        setNegocios(resultado.data)
      } catch {
        setError('Error al cargar los negocios')
      } finally {
        setCargando(false)
      }
    }

    cargarNegocios()
  }, [router])

  if (cargando) {
    return (
      <div className="vecino-card p-8 text-center">
        <p className="text-vecino-text-muted">Cargando tus negocios...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold text-vecino-brand">Mis negocios</h3>
          <p className="mt-1 text-sm text-vecino-text-muted">
            Administra los negocios desde los que vas a publicar productos.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => router.push('/vendedor/negocio/crear')}
            className="rounded-xl border border-vecino-border bg-vecino-surface-soft px-4 py-2.5 text-sm font-semibold text-vecino-brand"
          >
            Crear negocio
          </button>
          <button
            onClick={() => router.push('/vendedor/productos/publicar')}
            disabled={!negocios.some((negocio) => negocio.activo)}
            className="rounded-xl vecino-gradient px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Publicar producto
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      ) : null}

      {!negocios.length ? (
        <div className="vecino-card p-10 text-center">
          <p className="text-vecino-text-muted">Aun no tienes negocios registrados.</p>
          <button
            onClick={() => router.push('/vendedor/negocio/crear')}
            className="mt-5 rounded-xl vecino-gradient px-6 py-3 font-semibold text-white"
          >
            Crear mi primer negocio
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {negocios.map((negocio) => (
            <article key={negocio.id} className="vecino-card flex flex-wrap justify-between gap-4 p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold text-vecino-text">{negocio.nombre}</h4>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      negocio.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {negocio.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <p className="text-sm text-vecino-text-muted">
                  {negocio.categoria} · {negocio.ciudad}
                </p>
                <p className="text-sm text-vecino-text-muted">{negocio.direccion}</p>
                {negocio.horario ? (
                  <p className="text-sm text-vecino-text-muted">Horario: {negocio.horario}</p>
                ) : null}
                <p className="max-w-2xl text-sm leading-6 text-vecino-text-muted">
                  {negocio.descripcion || 'Sin descripcion registrada.'}
                </p>
              </div>

              <div className="flex items-start">
                <button
                  onClick={() => router.push('/vendedor/productos/publicar')}
                  disabled={!negocio.activo}
                  className="rounded-xl border border-vecino-border bg-white px-4 py-2 text-sm font-semibold text-vecino-brand disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Publicar producto
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

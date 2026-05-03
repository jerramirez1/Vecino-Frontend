'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { obtenerMisProductos, type Producto } from '@/services/producto.service'

const formatearPrecio = (precio: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(precio)

export default function MisProductosList() {
  const router = useRouter()
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const supabase = createSupabaseBrowserClient()
        const {
          data: { session }
        } = await supabase.auth.getSession()

        if (!session) {
          router.push('/iniciar-sesion')
          return
        }

        const resultado = await obtenerMisProductos(session.access_token)

        if (!resultado.success) {
          setError(resultado.mensaje || 'No fue posible cargar tus productos')
          return
        }

        setProductos(resultado.data)
      } catch {
        setError('Error al cargar los productos')
      } finally {
        setCargando(false)
      }
    }

    cargarProductos()
  }, [router])

  if (cargando) {
    return (
      <div className="vecino-card p-8 text-center">
        <p className="text-vecino-text-muted">Cargando tus productos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold text-vecino-brand">Productos publicados</h3>
          <p className="mt-1 text-sm text-vecino-text-muted">
            Los productos que publiques aqui se mostraran en el catalogo para consumidores registrados.
          </p>
        </div>

        <Link
          href="/vendedor/productos/publicar"
          className="rounded-xl vecino-gradient px-4 py-2.5 text-sm font-semibold text-white"
        >
          Publicar producto
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      ) : null}

      {!productos.length ? (
        <div className="vecino-card p-10 text-center">
          <p className="text-vecino-text-muted">Aun no has publicado productos.</p>
          <Link
            href="/vendedor/productos/publicar"
            className="mt-5 inline-flex rounded-xl vecino-gradient px-6 py-3 font-semibold text-white"
          >
            Publicar mi primer producto
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {productos.map((producto) => (
            <article key={producto.id} className="vecino-card overflow-hidden">
              <div className="relative h-56 w-full bg-vecino-surface-soft">
                <Image
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized
                />
              </div>

              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-vecino-text">{producto.nombre}</h4>
                    <p className="text-sm text-vecino-text-muted">
                      {producto.negocio?.nombre || 'Negocio asociado'}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {producto.activo ? 'Publicado' : 'Inactivo'}
                  </span>
                </div>

                <p className="text-sm leading-6 text-vecino-text-muted">{producto.descripcion}</p>
                <p className="text-lg font-semibold text-vecino-brand">{formatearPrecio(producto.precio)}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

import Image from 'next/image'
import { redirect } from 'next/navigation'
import { PanelShell } from '@/components/dashboard/panel-shell'
import { obtenerUsuarioActual } from '@/lib/auth/usuario'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { obtenerProductos, type Producto } from '@/services/producto.service'

const formatearPrecio = (precio: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(precio)

export default async function CatalogoPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/iniciar-sesion')
  }

  const usuario = await obtenerUsuarioActual(supabase, user.id, user.user_metadata)

  if (usuario.rol !== 'usuario') {
    redirect('/vendedor/productos/mis-productos')
  }

  let productos: Producto[] = []
  let error = ''

  try {
    const resultado = await obtenerProductos()

    if (resultado.success) {
      productos = resultado.data
    } else {
      error = resultado.mensaje || 'No fue posible cargar el catalogo'
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'No fue posible cargar el catalogo'
  }

  return (
    <PanelShell rol="usuario" titulo="Catalogo" vistaActiva="catalogo">
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-semibold text-vecino-brand">Productos disponibles</h3>
          <p className="mt-1 text-sm text-vecino-text-muted">
            Explora la oferta de comerciantes registrados en Vecino.
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        ) : null}

        {!error && !productos.length ? (
          <div className="vecino-card p-10 text-center">
            <p className="text-vecino-text-muted">Todavia no hay productos publicados en el catalogo.</p>
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {productos.map((producto) => (
            <article key={producto.id} className="vecino-card overflow-hidden">
              <div className="relative h-52 w-full bg-vecino-surface-soft">
                <Image
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1280px) 50vw, 33vw"
                  unoptimized
                />
              </div>

              <div className="space-y-3 p-5">
                <div>
                  <h4 className="text-lg font-semibold text-vecino-text">{producto.nombre}</h4>
                  <p className="text-sm text-vecino-text-muted">
                    {producto.negocio?.nombre || 'Comercio local'} · {producto.negocio?.ciudad || 'Ciudad'}
                  </p>
                </div>

                <p className="line-clamp-3 text-sm leading-6 text-vecino-text-muted">
                  {producto.descripcion}
                </p>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-lg font-semibold text-vecino-brand">
                    {formatearPrecio(producto.precio)}
                  </span>
                  <span className="rounded-full bg-vecino-surface-soft px-3 py-1 text-xs font-semibold text-vecino-text-muted">
                    {producto.negocio?.categoria || 'Producto'}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PanelShell>
  )
}

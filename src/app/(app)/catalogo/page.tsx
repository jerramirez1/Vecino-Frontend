import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PanelShell } from '@/components/dashboard/panel-shell'
import { obtenerUsuarioParaRuta } from '@/lib/auth/usuario'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { obtenerProductos, type Producto } from '@/services/producto.service'
import { ListaProductos } from './lista-productos'

export default async function CatalogoPage() {
  const supabase = await createSupabaseServerClient()
  const usuario = await obtenerUsuarioParaRuta(supabase, 'usuario')

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

        <ListaProductos productos={productos} />
      </div>
    </PanelShell>
  )
}

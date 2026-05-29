import { redirect } from 'next/navigation'
import { PanelShell } from '@/components/dashboard/panel-shell'
import { obtenerUsuarioParaRuta } from '@/lib/auth/usuario'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { MapaLoader } from './mapa-loader'

export default async function MapaPage() {
  const supabase = await createSupabaseServerClient()
  const usuario = await obtenerUsuarioParaRuta(supabase, 'usuario')

  if (usuario.rol !== 'usuario') {
    redirect('/vendedor/productos/mis-productos')
  }

  return (
    <PanelShell rol="usuario" titulo="Mapa" vistaActiva="mapa">
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-semibold text-vecino-brand">Negocios cercanos</h3>
          <p className="mt-1 text-sm text-vecino-text-muted">
            Descubre comercios alrededor de tu ubicacion. Filtra por categoria, distancia y calificacion.
          </p>
        </div>

        <MapaLoader />
      </div>
    </PanelShell>
  )
}

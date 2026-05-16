import { redirect } from 'next/navigation'
import { PanelShell } from '@/components/dashboard/panel-shell'
import { obtenerUsuarioParaRuta } from '@/lib/auth/usuario'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import MisProductosList from './MisProductosList'

export default async function MisProductosPage() {
  const supabase = await createSupabaseServerClient()
  const usuario = await obtenerUsuarioParaRuta(supabase, 'vendedor')

  if (usuario.rol !== 'vendedor') {
    redirect('/perfil')
  }

  return (
    <PanelShell rol="vendedor" titulo="Mis productos" vistaActiva="productos">
      <MisProductosList />
    </PanelShell>
  )
}

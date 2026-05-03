import { redirect } from 'next/navigation'
import { PanelShell } from '@/components/dashboard/panel-shell'
import { obtenerUsuarioActual } from '@/lib/auth/usuario'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import MisProductosList from './MisProductosList'

export default async function MisProductosPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/iniciar-sesion')
  }

  const usuario = await obtenerUsuarioActual(supabase, user.id, user.user_metadata)

  if (usuario.rol !== 'vendedor') {
    redirect('/perfil')
  }

  return (
    <PanelShell rol="vendedor" titulo="Mis productos" vistaActiva="productos">
      <MisProductosList />
    </PanelShell>
  )
}

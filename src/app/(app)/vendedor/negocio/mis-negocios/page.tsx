import { redirect } from 'next/navigation'
import { PanelShell } from '@/components/dashboard/panel-shell'
import { obtenerUsuarioParaRuta } from '@/lib/auth/usuario'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import MisNegociosList from './MisNegociosList'

export default async function MisNegociosPage() {
  const supabase = await createSupabaseServerClient()
  const usuario = await obtenerUsuarioParaRuta(supabase, 'vendedor')

  if (usuario.rol !== 'vendedor') {
    redirect('/perfil')
  }

  return (
    <PanelShell rol="vendedor" titulo="Mis negocios" vistaActiva="negocios">
      <MisNegociosList />
    </PanelShell>
  )
}

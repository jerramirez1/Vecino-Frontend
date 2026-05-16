import { redirect } from 'next/navigation'
import { PanelShell } from '@/components/dashboard/panel-shell'
import { obtenerUsuarioParaRuta } from '@/lib/auth/usuario'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import PublicarProductoForm from './PublicarProductoForm'

export default async function PublicarProductoPage() {
  const supabase = await createSupabaseServerClient()
  const usuario = await obtenerUsuarioParaRuta(supabase, 'vendedor')

  if (usuario.rol !== 'vendedor') {
    redirect('/perfil')
  }

  return (
    <PanelShell rol="vendedor" titulo="Publicar producto" vistaActiva="productos">
      <PublicarProductoForm />
    </PanelShell>
  )
}

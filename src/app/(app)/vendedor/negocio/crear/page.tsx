import { redirect } from 'next/navigation'
import { PanelShell } from '@/components/dashboard/panel-shell'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { obtenerUsuarioParaRuta } from '@/lib/auth/usuario'
import CrearNegocioForm from './CrearNegocioForm'

export default async function CrearNegocioPage() {
    const supabase = await createSupabaseServerClient()
    const usuario = await obtenerUsuarioParaRuta(supabase, 'vendedor')

    if (usuario.rol !== 'vendedor') {
        redirect('/perfil')
    }

    return (
        <PanelShell rol="vendedor" titulo="Crear negocio" vistaActiva="negocios">
            <CrearNegocioForm />
        </PanelShell>
    )
}

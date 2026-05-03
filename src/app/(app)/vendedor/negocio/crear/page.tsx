import { redirect } from 'next/navigation'
import { PanelShell } from '@/components/dashboard/panel-shell'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { obtenerUsuarioActual } from '@/lib/auth/usuario'
import CrearNegocioForm from './CrearNegocioForm'

export default async function CrearNegocioPage() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/iniciar-sesion')
    }

    const usuario = await obtenerUsuarioActual(
        supabase,
        user!.id,
        user!.user_metadata
    )

    if (usuario.rol !== 'vendedor') {
        redirect('/perfil')
    }

    return (
        <PanelShell rol="vendedor" titulo="Crear negocio" vistaActiva="negocios">
            <CrearNegocioForm />
        </PanelShell>
    )
}

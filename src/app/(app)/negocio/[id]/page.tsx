import Image from 'next/image'
import { notFound } from 'next/navigation'
import { PanelShell } from '@/components/dashboard/panel-shell'
import { obtenerNegocioPorId } from '@/services/negocio.service'
import { obtenerResenasNegocio } from '@/services/resena.service'
import { ResenasSeccion } from './ResenasSeccion'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function NegocioPerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { id } = await params
  const negocioRes = await obtenerNegocioPorId(id)

  if (!negocioRes.success || !negocioRes.data) {
    return (
      <PanelShell rol={user ? 'usuario' : 'invitado'} titulo="Error" vistaActiva="catalogo">
        <div className="p-8 text-center text-red-600 font-bold">
          Error al cargar el negocio: {JSON.stringify(negocioRes)} <br/>
          ID intentado: {id}
        </div>
      </PanelShell>
    )
  }

  const negocio = negocioRes.data
  const resenasRes = await obtenerResenasNegocio(id)
  const resenas = resenasRes.success ? resenasRes.data : []

  return (
    <PanelShell rol={user ? 'usuario' : 'invitado'} titulo="Perfil del Negocio" vistaActiva="catalogo">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="vecino-card overflow-hidden">
          {negocio.imagen_url && (
            <div className="relative h-64 w-full bg-vecino-surface-soft">
              <Image src={negocio.imagen_url} alt={negocio.nombre} fill className="object-cover" unoptimized />
            </div>
          )}
          <div className="p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-vecino-brand">{negocio.nombre}</h1>
                <p className="mt-2 text-vecino-text-muted">{negocio.categoria} · {negocio.ciudad}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-2xl font-bold text-amber-500">
                  <span className="text-3xl">★</span>
                  <span>{negocio.calificacion_promedio > 0 ? Number(negocio.calificacion_promedio).toFixed(1) : 'Sin calificar'}</span>
                </div>
                <p className="text-sm text-vecino-text-muted">{negocio.total_resenas} reseñas</p>
              </div>
            </div>
            
            <div className="mt-6 border-t border-vecino-border pt-6">
              <h2 className="text-xl font-semibold text-vecino-text">Acerca del negocio</h2>
              <p className="mt-3 leading-relaxed text-vecino-text-muted">{negocio.descripcion}</p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-vecino-text">Dirección</h3>
                <p className="text-vecino-text-muted">{negocio.direccion}</p>
              </div>
              <div>
                <h3 className="font-semibold text-vecino-text">Horario</h3>
                <p className="text-vecino-text-muted">{negocio.horario}</p>
              </div>
            </div>
          </div>
        </div>

        <ResenasSeccion 
          negocioId={negocio.id} 
          resenasIniciales={resenas} 
          usuarioId={user?.id}
        />
      </div>
    </PanelShell>
  )
}

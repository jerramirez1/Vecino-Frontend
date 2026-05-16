'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { crearResena, type Resena } from '@/services/resena.service'

export function ResenasSeccion({ negocioId, resenasIniciales, usuarioId }: { negocioId: string, resenasIniciales: Resena[], usuarioId?: string }) {
  const [resenas, setResenas] = useState<Resena[]>(resenasIniciales)
  const [calificacion, setCalificacion] = useState(5)
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usuarioId) {
      setError('Debes iniciar sesión para dejar una reseña.')
      return
    }
    
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const supabase = createSupabaseBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('Sesión expirada')
        return
      }

      const res = await crearResena(session.access_token, {
        negocioId,
        calificacion,
        comentario
      })

      if (res.success) {
        setSuccess('¡Reseña publicada con éxito!')
        setComentario('')
        setCalificacion(5)
        router.refresh()
      } else {
        setError(res.error + (res.detail ? ` (${res.detail})` : '') || 'Error al publicar la reseña.')
      }
    } catch (err: any) {
      setError('Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  const hasResenado = usuarioId && resenas.some(r => r.usuario_id === usuarioId)

  return (
    <div className="vecino-card p-8">
      <h2 className="text-2xl font-bold text-vecino-brand">Reseñas</h2>
      
      {!hasResenado && usuarioId ? (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-b border-vecino-border pb-8">
          <h3 className="font-semibold text-vecino-text">Dejar una reseña</h3>
          
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          {success && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">{success}</div>}

          <div>
            <label className="mb-2 block text-sm font-medium text-vecino-text-muted">Calificación</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCalificacion(num)}
                  className={`text-2xl ${calificacion >= num ? 'text-amber-500' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="comentario" className="mb-2 block text-sm font-medium text-vecino-text-muted">Comentario (opcional)</label>
            <textarea
              id="comentario"
              rows={3}
              className="w-full rounded-lg border border-vecino-border bg-vecino-surface px-4 py-2 text-vecino-text outline-none focus:border-vecino-brand"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="¿Cómo fue tu experiencia?"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-vecino-brand px-6 py-2 font-semibold text-white hover:bg-vecino-brand-hover disabled:opacity-50 transition-colors"
          >
            {loading ? 'Publicando...' : 'Publicar Reseña'}
          </button>
        </form>
      ) : hasResenado ? (
        <div className="mt-6 rounded-lg bg-vecino-surface-soft p-4 text-center text-sm font-medium text-vecino-text-muted">
          Ya has dejado una reseña para este negocio.
        </div>
      ) : (
        <div className="mt-6 rounded-lg bg-vecino-surface-soft p-4 text-center text-sm font-medium text-vecino-text-muted">
          Inicia sesión para dejar una reseña.
        </div>
      )}

      <div className="mt-8 space-y-6">
        {resenasIniciales.length === 0 ? (
          <p className="text-center text-vecino-text-muted">Aún no hay reseñas para este negocio.</p>
        ) : (
          resenasIniciales.map((resena) => (
            <div key={resena.id} className="border-b border-vecino-border pb-6 last:border-0 last:pb-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-vecino-text">{resena.usuarios?.nombre_completo || 'Usuario'}</span>
                <span className="text-sm text-vecino-text-muted">{new Date(resena.created_at).toLocaleDateString()}</span>
              </div>
              <div className="mt-1 text-amber-500">
                {'★'.repeat(resena.calificacion)}{'☆'.repeat(5 - resena.calificacion)}
              </div>
              {resena.comentario && <p className="mt-2 text-vecino-text-muted">{resena.comentario}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

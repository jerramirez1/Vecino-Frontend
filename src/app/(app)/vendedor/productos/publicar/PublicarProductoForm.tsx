'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { obtenerMisNegocios } from '@/services/negocio.service'
import { crearProducto } from '@/services/producto.service'

interface Negocio {
  id: string
  nombre: string
  categoria: string
  ciudad: string
  activo: boolean
}

type ErroresFormulario = Partial<Record<'negocio_id' | 'nombre' | 'descripcion' | 'precio' | 'imagen_url', string>>

export default function PublicarProductoForm() {
  const router = useRouter()
  const [negocios, setNegocios] = useState<Negocio[]>([])
  const [cargandoNegocios, setCargandoNegocios] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [errores, setErrores] = useState<ErroresFormulario>({})
  const [form, setForm] = useState({
    negocio_id: '',
    nombre: '',
    descripcion: '',
    precio: '',
    imagen_url: ''
  })

  useEffect(() => {
    const cargarNegocios = async () => {
      try {
        const supabase = createSupabaseBrowserClient()
        const {
          data: { session }
        } = await supabase.auth.getSession()

        if (!session) {
          router.push('/iniciar-sesion')
          return
        }

        const resultado = await obtenerMisNegocios(session.access_token)

        if (!resultado.success) {
          setErrorGeneral(resultado.mensaje || 'No fue posible cargar tus negocios')
          return
        }

        const activos = (resultado.data as Negocio[]).filter((negocio) => negocio.activo)
        setNegocios(activos)

        if (activos.length === 1) {
          setForm((prev) => ({ ...prev, negocio_id: activos[0].id }))
        }
      } catch {
        setErrorGeneral('No fue posible cargar los negocios disponibles')
      } finally {
        setCargandoNegocios(false)
      }
    }

    cargarNegocios()
  }, [router])

  const tieneNegociosActivos = useMemo(() => negocios.length > 0, [negocios])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrores((prev) => ({ ...prev, [name]: undefined }))
  }

  const validarFormulario = () => {
    const nuevosErrores: ErroresFormulario = {}

    if (!form.negocio_id) {
      nuevosErrores.negocio_id = 'Debes seleccionar el negocio que publicara este producto'
    }
    if (!form.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre del producto es obligatorio'
    }
    if (!form.descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripcion del producto es obligatoria'
    }

    const precio = Number(form.precio)
    if (!form.precio.trim()) {
      nuevosErrores.precio = 'El precio es obligatorio'
    } else if (!Number.isFinite(precio) || precio <= 0) {
      nuevosErrores.precio = 'El precio debe ser mayor a 0'
    }

    if (!form.imagen_url.trim()) {
      nuevosErrores.imagen_url = 'La imagen del producto es obligatoria'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validarFormulario()) {
      return
    }

    setErrorGeneral('')
    setGuardando(true)

    try {
      const supabase = createSupabaseBrowserClient()
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/iniciar-sesion')
        return
      }

      const resultado = await crearProducto(session.access_token, {
        negocio_id: form.negocio_id,
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precio: Number(form.precio),
        imagen_url: form.imagen_url.trim()
      })

      if (!resultado.success) {
        setErrorGeneral(resultado.mensaje || 'No fue posible publicar el producto')
        return
      }

      router.push('/vendedor/productos/mis-productos')
      router.refresh()
    } catch {
      setErrorGeneral('Error al publicar el producto. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  if (cargandoNegocios) {
    return (
      <div className="vecino-card p-8 text-center">
        <p className="text-vecino-text-muted">Cargando negocios disponibles...</p>
      </div>
    )
  }

  if (!tieneNegociosActivos) {
    return (
      <div className="vecino-card p-8">
        <h3 className="text-2xl font-semibold text-vecino-brand">Primero crea un negocio</h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-vecino-text-muted">
          Para publicar productos necesitas al menos un negocio activo asociado a tu cuenta de comerciante.
        </p>
        <Link
          href="/vendedor/negocio/crear"
          className="mt-6 inline-flex rounded-xl vecino-gradient px-5 py-3 font-semibold text-white"
        >
          Crear negocio
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <section className="vecino-card p-6 sm:p-8">
        <h3 className="text-2xl font-semibold text-vecino-brand">Nuevo producto</h3>
        <p className="mt-2 text-sm leading-6 text-vecino-text-muted">
          Completa la informacion obligatoria para que el producto aparezca correctamente en el catalogo.
        </p>

        {errorGeneral ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {errorGeneral}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-vecino-text">Negocio</label>
            <select
              name="negocio_id"
              value={form.negocio_id}
              onChange={handleChange}
              className="w-full rounded-xl border border-vecino-border bg-white px-4 py-3 text-sm text-vecino-text outline-none focus:border-vecino-brand"
            >
              <option value="">Selecciona un negocio</option>
              {negocios.map((negocio) => (
                <option key={negocio.id} value={negocio.id}>
                  {negocio.nombre} · {negocio.categoria} · {negocio.ciudad}
                </option>
              ))}
            </select>
            {errores.negocio_id ? (
              <p className="mt-1 text-xs font-semibold text-red-600">{errores.negocio_id}</p>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-vecino-text">Nombre del producto</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej. Pandebono tradicional"
                className="w-full rounded-xl border border-vecino-border bg-white px-4 py-3 text-sm text-vecino-text outline-none focus:border-vecino-brand"
              />
              {errores.nombre ? (
                <p className="mt-1 text-xs font-semibold text-red-600">{errores.nombre}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-vecino-text">Precio</label>
              <input
                name="precio"
                type="number"
                min="0"
                step="0.01"
                value={form.precio}
                onChange={handleChange}
                placeholder="3500"
                className="w-full rounded-xl border border-vecino-border bg-white px-4 py-3 text-sm text-vecino-text outline-none focus:border-vecino-brand"
              />
              {errores.precio ? (
                <p className="mt-1 text-xs font-semibold text-red-600">{errores.precio}</p>
              ) : null}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-vecino-text">Descripcion</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={4}
              placeholder="Describe lo que hace atractivo este producto para tus clientes."
              className="w-full rounded-xl border border-vecino-border bg-white px-4 py-3 text-sm text-vecino-text outline-none focus:border-vecino-brand"
            />
            {errores.descripcion ? (
              <p className="mt-1 text-xs font-semibold text-red-600">{errores.descripcion}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-vecino-text">URL de imagen</label>
            <input
              name="imagen_url"
              type="url"
              value={form.imagen_url}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full rounded-xl border border-vecino-border bg-white px-4 py-3 text-sm text-vecino-text outline-none focus:border-vecino-brand"
            />
            {errores.imagen_url ? (
              <p className="mt-1 text-xs font-semibold text-red-600">{errores.imagen_url}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Link
              href="/vendedor/productos/mis-productos"
              className="rounded-xl border border-vecino-border bg-white px-4 py-3 text-sm font-semibold text-vecino-text"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={guardando}
              className="rounded-xl vecino-gradient px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {guardando ? 'Publicando...' : 'Publicar producto'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import type { Producto } from '@/services/producto.service'
import { crearPedido } from '@/services/pedido.service'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

interface ListaProductosProps {
  productos: Producto[]
}

const formatearPrecio = (precio: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(precio)

export function ListaProductos({ productos }: ListaProductosProps) {
  const [paginaActual, setPaginaActual] = useState(1)
  const itemsPorPagina = 5
  const [carrito, setCarrito] = useState<{ [key: string]: number }>({})
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [carritoAbierto, setCarritoAbierto] = useState(false)

  const agregarAlCarrito = (productoId: string) => {
    setCarrito(prev => ({
      ...prev,
      [productoId]: (prev[productoId] || 0) + 1
    }))
  }

  const eliminarDelCarrito = (productoId: string) => {
    setCarrito(prev => {
      const nuevo = { ...prev }
      if (nuevo[productoId] > 1) {
        nuevo[productoId]--
      } else {
        delete nuevo[productoId]
      }
      return nuevo
    })
  }

  const removerDelCarrito = (productoId: string) => {
    setCarrito(prev => {
      const nuevo = { ...prev }
      delete nuevo[productoId]
      return nuevo
    })
  }

  const crearPedidoDesdeCarrito = async () => {
    const items = Object.entries(carrito).map(([productoId, cantidad]) => ({
      producto_id: productoId,
      cantidad
    }))

    if (items.length === 0) {
      setMensaje('El carrito está vacío')
      return
    }

    const primerProducto = productos.find(p => p.id === items[0].producto_id)
    if (!primerProducto?.negocio?.id) {
      setMensaje('Error: no se pudo identificar el negocio')
      return
    }

    const negocioId = primerProducto.negocio.id
    const todosMismoNegocio = items.every(item => {
      const producto = productos.find(p => p.id === item.producto_id)
      return producto?.negocio?.id === negocioId
    })

    if (!todosMismoNegocio) {
      setMensaje('Solo puedes pedir productos de un mismo negocio a la vez')
      return
    }

    setCargando(true)
    setMensaje('')

    try {
      const supabase = createSupabaseBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''

      const resultado = await crearPedido(token, negocioId, items)

      if (resultado.success) {
        setMensaje('¡Pedido creado exitosamente!')
        setCarrito({})
        setCarritoAbierto(false)
        setTimeout(() => setMensaje(''), 3000)
      } else {
        setMensaje(resultado.mensaje || 'Error al crear el pedido')
      }
    } catch (error) {
      setMensaje('Error al crear el pedido')
      console.error(error)
    } finally {
      setCargando(false)
    }
  }

  const totalItems = Object.values(carrito).reduce((sum, cantidad) => sum + cantidad, 0)
  
  const calcularTotal = () => {
    return Object.entries(carrito).reduce((total, [productoId, cantidad]) => {
      const producto = productos.find(p => p.id === productoId)
      return total + (producto?.precio || 0) * cantidad
    }, 0)
  }

  const productosEnCarrito = Object.entries(carrito).map(([productoId, cantidad]) => ({
    producto: productos.find(p => p.id === productoId),
    cantidad
  })).filter(item => item.producto)

  const totalPaginas = Math.ceil(productos.length / itemsPorPagina)
  const productosPaginados = productos.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  )

  return (
    <>
      {mensaje && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
          mensaje.includes('exitosamente') 
            ? 'border-green-200 bg-green-50 text-green-600' 
            : 'border-red-200 bg-red-50 text-red-600'
        }`}>
          {mensaje}
        </div>
      )}

      {/* Botón flotante del carrito */}
      {totalItems > 0 && (
        <button
          onClick={() => setCarritoAbierto(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-vecino-brand px-6 py-3 text-white shadow-lg hover:bg-vecino-brand/90 transition-colors"
        >
          <ShoppingBag size={20} />
          <span className="font-semibold">{totalItems}</span>
        </button>
      )}

      {/* Sidebar del carrito */}
      {carritoAbierto && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setCarritoAbierto(false)}
          />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-xl font-semibold text-vecino-brand">Carrito de compras</h2>
                <button
                  onClick={() => setCarritoAbierto(false)}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {productosEnCarrito.length === 0 ? (
                  <p className="text-center text-vecino-text-muted">El carrito está vacío</p>
                ) : (
                  <div className="space-y-4">
                    {productosEnCarrito.map(({ producto, cantidad }) => (
                      <div key={producto!.id} className="flex gap-4 rounded-lg border p-3">
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          <Image
                            src={producto!.imagen_url}
                            alt={producto!.nombre}
                            fill
                            className="object-cover"
                            sizes="80px"
                            unoptimized
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <h4 className="font-semibold text-vecino-brand line-clamp-1">{producto!.nombre}</h4>
                          <p className="text-sm text-vecino-text-muted">{producto!.negocio?.nombre}</p>
                          <p className="mt-auto font-semibold text-vecino-brand">{formatearPrecio(producto!.precio)}</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <button
                            onClick={() => removerDelCarrito(producto!.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => eliminarDelCarrito(producto!.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-gray-100"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center font-semibold">{cantidad}</span>
                            <button
                              onClick={() => agregarAlCarrito(producto!.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-gray-100"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-lg font-semibold text-vecino-brand">Total</span>
                  <span className="text-2xl font-bold text-vecino-brand">{formatearPrecio(calcularTotal())}</span>
                </div>
                <button
                  onClick={crearPedidoDesdeCarrito}
                  disabled={cargando || productosEnCarrito.length === 0}
                  className="vecino-button vecino-button-primary w-full py-3"
                >
                  {cargando ? 'Procesando...' : 'Crear Pedido'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {productosPaginados.map((producto) => {
          const cantidadEnCarrito = carrito[producto.id] || 0
          return (
            <article key={producto.id} className="vecino-card overflow-hidden">
              <div className="relative h-52 w-full bg-vecino-surface-soft">
                <Image
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1280px) 50vw, 33vw"
                  unoptimized
                />
              </div>

              <div className="space-y-3 p-5">
                <div>
                  <h4 className="text-lg font-semibold text-vecino-text">{producto.nombre}</h4>
                  <p className="text-sm text-vecino-text-muted">
                    {producto.negocio ? (
                      <Link href={`/negocio/${producto.negocio.id}`} className="font-medium text-vecino-brand hover:underline">
                        {producto.negocio.nombre}
                      </Link>
                    ) : 'Comercio local'} · {producto.negocio?.ciudad || 'Ciudad'}
                  </p>
                </div>

                <p className="line-clamp-3 text-sm leading-6 text-vecino-text-muted">
                  {producto.descripcion}
                </p>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-lg font-semibold text-vecino-brand">
                    {formatearPrecio(producto.precio)}
                  </span>
                  <span className="rounded-full bg-vecino-surface-soft px-3 py-1 text-xs font-semibold text-vecino-text-muted">
                    {producto.negocio?.categoria || 'Producto'}
                  </span>
                </div>

                {cantidadEnCarrito > 0 ? (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => eliminarDelCarrito(producto.id)}
                      className="vecino-button vecino-button-secondary px-4 py-2"
                    >
                      -
                    </button>
                    <span className="font-semibold">{cantidadEnCarrito}</span>
                    <button
                      onClick={() => agregarAlCarrito(producto.id)}
                      className="vecino-button vecino-button-secondary px-4 py-2"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => agregarAlCarrito(producto.id)}
                    className="vecino-button vecino-button-primary w-full"
                  >
                    Agregar al carrito
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
            className="rounded-lg border border-vecino-border px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-vecino-surface-soft"
          >
            Anterior
          </button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
            <button
              key={pagina}
              onClick={() => setPaginaActual(pagina)}
              className={`rounded-lg px-4 py-2 text-sm ${
                paginaActual === pagina
                  ? 'bg-vecino-brand text-white'
                  : 'border border-vecino-border hover:bg-vecino-surface-soft'
              }`}
            >
              {pagina}
            </button>
          ))}
          <button
            onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
            disabled={paginaActual === totalPaginas}
            className="rounded-lg border border-vecino-border px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-vecino-surface-soft"
          >
            Siguiente
          </button>
        </div>
      )}
    </>
  )
}

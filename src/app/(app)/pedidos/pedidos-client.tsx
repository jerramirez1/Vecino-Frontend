'use client'

import { Package, Clock, MapPin, ArrowRight, Search, ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { PanelShell } from "@/components/dashboard/panel-shell";
import type { Pedido } from "@/services/pedido.service";

interface PedidosClientProps {
  pedidos: Pedido[]
}

export function PedidosClient({ pedidos: initialPedidos }: PedidosClientProps) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroFecha, setFiltroFecha] = useState('todos')
  const [paginaActual, setPaginaActual] = useState(1)
  const itemsPorPagina = 10

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmado':
        return 'bg-blue-100 text-blue-800';
      case 'en_preparacion':
        return 'bg-purple-100 text-purple-800';
      case 'en_camino':
        return 'bg-orange-100 text-orange-800';
      case 'entregado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'confirmado':
        return 'Confirmado';
      case 'en_preparacion':
        return 'En preparación';
      case 'en_camino':
        return 'En camino';
      case 'entregado':
        return 'Entregado';
      default:
        return estado;
    }
  };

  /**
   * Formatea una fecha al formato local colombiano
   * @param fecha - Fecha en formato ISO string
   * @returns Fecha formateada en formato DD/MM/YYYY HH:MM
   */
  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Componente para mostrar fechas con suppressHydrationWarning
   * Evita errores de hydration de React debido a diferencias de zona horaria
   * entre servidor y cliente
   */
  const FechaConHydrationWarning = ({ fecha }: { fecha: string }) => {
    return (
      <span suppressHydrationWarning>
        {formatearFecha(fecha)}
      </span>
    );
  };

  /**
   * Formatea un precio al formato de moneda colombiana
   * @param precio - Valor numérico del precio
   * @returns Precio formateado en COP (ej: $25.000)
   */
  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(precio);
  };

  const obtenerNombresProductos = (pedido: Pedido) => {
    if (!pedido.detalles || pedido.detalles.length === 0) return ''
    const nombres = pedido.detalles.map(d => d.producto?.nombre || 'Producto').slice(0, 3)
    if (pedido.detalles.length > 3) {
      nombres.push(`+${pedido.detalles.length - 3} más`)
    }
    return nombres.join(', ')
  };

  const pedidosFiltrados = useMemo(() => {
    let filtrados = [...initialPedidos]

    // Filtro por búsqueda
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase()
      filtrados = filtrados.filter(pedido =>
        pedido.negocio?.nombre?.toLowerCase().includes(busquedaLower) ||
        pedido.detalles?.some(d => d.producto?.nombre?.toLowerCase().includes(busquedaLower))
      )
    }

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      filtrados = filtrados.filter(pedido => pedido.estado === filtroEstado)
    }

    // Filtro por fecha
    if (filtroFecha !== 'todos') {
      const ahora = new Date()
      filtrados = filtrados.filter(pedido => {
        const fechaPedido = new Date(pedido.created_at)
        if (filtroFecha === 'hoy') {
          return fechaPedido.toDateString() === ahora.toDateString()
        } else if (filtroFecha === 'semana') {
          const semanaAtras = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000)
          return fechaPedido >= semanaAtras
        } else if (filtroFecha === 'mes') {
          const mesAtras = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)
          return fechaPedido >= mesAtras
        }
        return true
      })
    }

    return filtrados
  }, [initialPedidos, busqueda, filtroEstado, filtroFecha])

  const totalPaginas = Math.ceil(pedidosFiltrados.length / itemsPorPagina)
  const pedidosPaginados = pedidosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  )

  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltroEstado('todos')
    setFiltroFecha('todos')
    setPaginaActual(1)
  }

  return (
    <PanelShell rol="usuario" titulo="Mis Pedidos" vistaActiva="pedidos">
      <div className="space-y-6">
        {/* Filtros y búsqueda */}
        <div className="vecino-card p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-vecino-text-muted" />
              <input
                type="text"
                placeholder="Buscar por negocio o producto..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value)
                  setPaginaActual(1)
                }}
                className="w-full rounded-lg border border-vecino-border bg-white py-2.5 pl-10 pr-4 text-sm focus:border-vecino-brand focus:outline-none focus:ring-2 focus:ring-vecino-brand/20"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <select
                  value={filtroEstado}
                  onChange={(e) => {
                    setFiltroEstado(e.target.value)
                    setPaginaActual(1)
                  }}
                  className="appearance-none rounded-lg border border-vecino-border bg-white px-4 py-2.5 pr-10 text-sm focus:border-vecino-brand focus:outline-none focus:ring-2 focus:ring-vecino-brand/20"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="en_preparacion">En preparación</option>
                  <option value="en_camino">En camino</option>
                  <option value="entregado">Entregado</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vecino-text-muted" />
              </div>
              <div className="relative">
                <select
                  value={filtroFecha}
                  onChange={(e) => {
                    setFiltroFecha(e.target.value)
                    setPaginaActual(1)
                  }}
                  className="appearance-none rounded-lg border border-vecino-border bg-white px-4 py-2.5 pr-10 text-sm focus:border-vecino-brand focus:outline-none focus:ring-2 focus:ring-vecino-brand/20"
                >
                  <option value="todos">Todas las fechas</option>
                  <option value="hoy">Hoy</option>
                  <option value="semana">Última semana</option>
                  <option value="mes">Último mes</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vecino-text-muted" />
              </div>
              {(busqueda || filtroEstado !== 'todos' || filtroFecha !== 'todos') && (
                <button
                  onClick={limpiarFiltros}
                  className="flex items-center gap-2 rounded-lg border border-vecino-border px-4 py-2.5 text-sm text-vecino-text-muted hover:bg-vecino-surface-soft"
                >
                  <X size={16} />
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="text-sm text-vecino-text-muted">
          Mostrando {pedidosFiltrados.length} pedido{pedidosFiltrados.length !== 1 ? 's' : ''}
        </div>

        {pedidosFiltrados.length === 0 ? (
          <div className="vecino-card p-8 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-vecino-text-muted" />
            <h3 className="mb-2 text-2xl font-semibold text-vecino-brand">
              {initialPedidos.length === 0 ? 'No tienes pedidos aún' : 'No se encontraron pedidos'}
            </h3>
            <p className="mb-6 text-vecino-text-muted">
              {initialPedidos.length === 0 
                ? 'Explora el catálogo y realiza tu primera compra'
                : 'Intenta ajustar los filtros de búsqueda'
              }
            </p>
            {initialPedidos.length === 0 && (
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 rounded-xl bg-vecino-brand px-6 py-3 text-white transition-colors hover:bg-vecino-brand/90"
              >
                Ir al catálogo
                <ArrowRight size={20} />
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pedidosPaginados.map((pedido) => (
                <Link
                  key={pedido.id}
                  href={`/pedidos/${pedido.id}`}
                  className="vecino-card block p-4 transition-colors hover:bg-vecino-surface-soft"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getEstadoColor(pedido.estado)}`}>
                        {getEstadoLabel(pedido.estado)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-vecino-text-muted">
                        <Clock size={12} />
                        <FechaConHydrationWarning fecha={pedido.created_at} />
                      </span>
                    </div>
                    <h4 className="text-base font-semibold text-vecino-brand line-clamp-1">
                      {pedido.negocio?.nombre || 'Negocio'}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-vecino-text-muted">
                      <MapPin size={12} />
                      <span className="line-clamp-1">{pedido.negocio?.direccion || 'Dirección no disponible'}</span>
                    </div>
                    <p className="text-xs text-vecino-text-muted line-clamp-2">
                      {obtenerNombresProductos(pedido)}
                    </p>
                    <div className="mt-auto pt-2 border-t border-vecino-border">
                      <p className="text-lg font-bold text-vecino-brand">
                        {formatearPrecio(pedido.total)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
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
        )}
      </div>
    </PanelShell>
  );
}

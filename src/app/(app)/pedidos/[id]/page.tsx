import { ArrowLeft, ArrowRight, Package, Clock, MapPin, ShoppingBag, History } from "lucide-react";
import Link from "next/link";
import { PanelShell } from "@/components/dashboard/panel-shell";
import { obtenerUsuarioParaRuta } from "@/lib/auth/usuario";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { obtenerPedidoPorId, obtenerHistorialPedido } from "@/services/pedido.service";
import { obtenerToken } from "@/lib/auth/token";

export default async function PedidoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const usuario = await obtenerUsuarioParaRuta(supabase, "usuario");
  const token = await obtenerToken(supabase);
  const { id } = await params;

  if (usuario.rol === "vendedor") {
    return null;
  }

  const pedidoResponse = await obtenerPedidoPorId(token, id);
  const pedido = pedidoResponse.success ? pedidoResponse.data : null;

  const historialResponse = await obtenerHistorialPedido(token, id);
  const historial = historialResponse.success ? historialResponse.data : [];

  if (!pedido) {
    return (
      <PanelShell rol="usuario" titulo="Pedido no encontrado" vistaActiva="pedidos">
        <div className="vecino-card p-8 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-vecino-text-muted" />
          <h3 className="mb-2 text-2xl font-semibold text-vecino-brand">
            {pedidoResponse?.mensaje || 'Pedido no encontrado'}
          </h3>
          <p className="mb-6 text-vecino-text-muted">
            {pedidoResponse?.mensaje ? 'Hubo un error al cargar el pedido. Por favor intenta nuevamente.' : 'El pedido que buscas no existe o no tienes acceso a él.'}
          </p>
          <Link
            href="/pedidos"
            className="inline-flex items-center gap-2 rounded-xl bg-vecino-brand px-6 py-3 text-white transition-colors hover:bg-vecino-brand/90"
          >
            <ArrowLeft size={20} />
            Volver a mis pedidos
          </Link>
        </div>
      </PanelShell>
    );
  }

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

  return (
    <PanelShell rol="usuario" titulo="Detalle del Pedido" vistaActiva="pedidos">
      <div className="space-y-6">
        <Link
          href="/pedidos"
          className="inline-flex items-center gap-2 text-vecino-text-muted transition-colors hover:text-vecino-brand"
        >
          <ArrowLeft size={20} />
          Volver a mis pedidos
        </Link>

        {/* Información principal del pedido */}
        <div className="vecino-card p-6 sm:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="mb-2 text-2xl font-semibold text-vecino-brand">
                {pedido.negocio?.nombre || 'Negocio'}
              </h3>
              <div className="flex items-center gap-2 text-vecino-text-muted">
                <MapPin size={16} />
                <span className="text-sm">{pedido.negocio?.direccion || 'Dirección no disponible'}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`rounded-full px-4 py-2 text-sm font-medium ${getEstadoColor(pedido.estado)}`}>
                {getEstadoLabel(pedido.estado)}
              </span>
              <span className="flex items-center gap-1 text-sm text-vecino-text-muted">
                <Clock size={16} />
                <span suppressHydrationWarning>{formatearFecha(pedido.created_at)}</span>
              </span>
            </div>
          </div>

          {/* Detalles de productos */}
          <div className="mb-6">
            <h4 className="mb-4 flex items-center gap-2 text-xl font-semibold text-vecino-brand">
              <ShoppingBag size={20} />
              Productos
            </h4>
            <div className="space-y-3">
              {pedido.detalles?.map((detalle: any) => (
                <div key={detalle.id} className="flex items-center justify-between rounded-xl bg-vecino-surface-soft p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-gray-200">
                      {detalle.producto?.imagen_url && (
                        <img
                          src={detalle.producto.imagen_url}
                          alt={detalle.producto.nombre}
                          className="h-full w-full rounded-lg object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-vecino-brand">{detalle.producto?.nombre || 'Producto'}</p>
                      <p className="text-sm text-vecino-text-muted">Cantidad: {detalle.cantidad}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-vecino-text-muted">Precio unitario</p>
                    <p className="font-semibold text-vecino-brand">{formatearPrecio(detalle.precio_unitario)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t border-vecino-border pt-4">
            <span className="text-xl font-semibold text-vecino-brand">Total del pedido</span>
            <span className="text-3xl font-bold text-vecino-brand">{formatearPrecio(pedido.total)}</span>
          </div>
        </div>

        {/* Historial de estados */}
        <div className="vecino-card p-6 sm:p-8">
          <h4 className="mb-4 flex items-center gap-2 text-xl font-semibold text-vecino-brand">
            <History size={20} />
            Historial de cambios
          </h4>
          {historial.length === 0 ? (
            <p className="text-vecino-text-muted">No hay historial de cambios disponible.</p>
          ) : (
            <div className="space-y-3">
              {historial.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 rounded-xl bg-vecino-surface-soft p-4">
                  <div className="flex flex-1 items-center gap-4">
                    {item.estado_anterior && (
                      <span className={`rounded-full px-3 py-1 text-sm font-medium ${getEstadoColor(item.estado_anterior)}`}>
                        {getEstadoLabel(item.estado_anterior)}
                      </span>
                    )}
                    <ArrowRight size={16} className="text-vecino-text-muted" />
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${getEstadoColor(item.estado_nuevo)}`}>
                      {getEstadoLabel(item.estado_nuevo)}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-sm text-vecino-text-muted">
                    <Clock size={14} />
                    <span suppressHydrationWarning>{formatearFecha(item.fecha_cambio)}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PanelShell>
  );
}

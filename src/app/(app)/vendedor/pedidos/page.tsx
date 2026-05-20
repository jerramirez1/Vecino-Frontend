import { Package, Clock, User, CheckCircle, ArrowRight } from "lucide-react";
import { PanelShell } from "@/components/dashboard/panel-shell";
import { obtenerUsuarioParaRuta } from "@/lib/auth/usuario";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { obtenerMisNegocios } from "@/services/negocio.service";
import { obtenerPedidosDeNegocio, actualizarEstadoPedido } from "@/services/pedido.service";
import { obtenerToken } from "@/lib/auth/token";

export default async function PedidosVendedorPage() {
  const supabase = await createSupabaseServerClient();
  const usuario = await obtenerUsuarioParaRuta(supabase, "vendedor");
  const token = await obtenerToken(supabase);

  // Obtener el primer negocio del vendedor
  const negociosResponse = await obtenerMisNegocios(token);
  const negocios = negociosResponse.success ? negociosResponse.data : [];
  const negocioPrincipal = negocios.length > 0 ? negocios[0] : null;

  if (!negocioPrincipal) {
    return (
      <PanelShell rol="vendedor" titulo="Gestión de Pedidos" vistaActiva="pedidos">
        <div className="vecino-card p-8 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-vecino-text-muted" />
          <h3 className="mb-2 text-2xl font-semibold text-vecino-brand">No tienes negocios</h3>
          <p className="mb-6 text-vecino-text-muted">
            Crea un negocio primero para poder gestionar pedidos
          </p>
        </div>
      </PanelShell>
    );
  }

  const pedidosResponse = await obtenerPedidosDeNegocio(token, negocioPrincipal.id);
  const pedidos = pedidosResponse.success ? pedidosResponse.data : [];

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

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(precio);
  };

  const getNextEstado = (estadoActual: string) => {
    const estados = ['pendiente', 'confirmado', 'en_preparacion', 'en_camino', 'entregado'];
    const currentIndex = estados.indexOf(estadoActual);
    if (currentIndex < estados.length - 1) {
      return estados[currentIndex + 1];
    }
    return null;
  };

  return (
    <PanelShell rol="vendedor" titulo="Gestión de Pedidos" vistaActiva="pedidos">
      <div className="space-y-6">
        <div className="vecino-card p-6">
          <h3 className="mb-4 text-xl font-semibold text-vecino-brand">
            {negocioPrincipal.nombre}
          </h3>
          <p className="text-vecino-text-muted">
            Gestiona los pedidos de tu negocio
          </p>
        </div>

        {pedidos.length === 0 ? (
          <div className="vecino-card p-8 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-vecino-text-muted" />
            <h3 className="mb-2 text-2xl font-semibold text-vecino-brand">No hay pedidos</h3>
            <p className="text-vecino-text-muted">
              Cuando los clientes realicen pedidos, aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido: any) => {
              const nextEstado = getNextEstado(pedido.estado);
              return (
                <div key={pedido.id} className="vecino-card p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-sm font-medium ${getEstadoColor(pedido.estado)}`}>
                          {getEstadoLabel(pedido.estado)}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-vecino-text-muted">
                          <Clock size={16} />
                          {formatearFecha(pedido.created_at)}
                        </span>
                      </div>
                      
                      <div className="mb-3 flex items-center gap-2 text-vecino-text-muted">
                        <User size={16} />
                        <span className="text-sm">
                          {pedido.usuarios?.nombre_completo || 'Cliente'}
                        </span>
                        <span className="text-sm">
                          ({pedido.usuarios?.email || 'email@example.com'})
                        </span>
                      </div>

                      <div className="text-right sm:text-left">
                        <p className="mb-1 text-sm text-vecino-text-muted">Total del pedido</p>
                        <p className="text-2xl font-bold text-vecino-brand">
                          {formatearPrecio(pedido.total)}
                        </p>
                      </div>
                    </div>

                    {nextEstado && (
                      <div className="flex flex-col gap-2">
                        <form action={async () => {
                          'use server';
                          await actualizarEstadoPedido(token, pedido.id, nextEstado);
                        }}>
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-xl bg-vecino-brand px-4 py-2 text-white transition-colors hover:bg-vecino-brand/90"
                          >
                            <CheckCircle size={18} />
                            Avanzar a {getEstadoLabel(nextEstado)}
                            <ArrowRight size={18} />
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PanelShell>
  );
}

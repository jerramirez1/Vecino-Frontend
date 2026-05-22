export interface Pedido {
  id: string
  usuario_id: string
  negocio_id: string
  total: number
  estado: string
  created_at: string
  updated_at: string
  negocio?: {
    id: string
    nombre: string
    direccion: string
  }
  detalles?: DetallePedido[]
}

export interface DetallePedido {
  id: string
  pedido_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  created_at: string
  producto?: {
    nombre: string
    imagen_url: string
  }
}

export interface HistorialEstado {
  id: string
  pedido_id: string
  estado_anterior: string | null
  estado_nuevo: string
  fecha_cambio: string
  created_at: string
}

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' ? 'http://localhost:4010/api/mock' : '')

  if (!apiUrl) {
    throw new Error('Falta configurar NEXT_PUBLIC_API_URL')
  }

  return apiUrl
}

// Obtener mis pedidos (HU-06)
export const obtenerMisPedidos = async (token: string) => {
  if (token === 'mock-token') {
    return {
      success: true,
      data: [
        {
          id: 'mock-1',
          negocio_id: 'mock-negocio-1',
          total: 25000,
          estado: 'pendiente',
          created_at: new Date().toISOString(),
          negocio: {
            id: 'mock-negocio-1',
            nombre: 'Ferretería Vecino (Mock)',
            direccion: 'Calle Falsa 123'
          }
        },
        {
          id: 'mock-2',
          negocio_id: 'mock-negocio-1',
          total: 50000,
          estado: 'en_camino',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          negocio: {
            id: 'mock-negocio-1',
            nombre: 'Ferretería Vecino (Mock)',
            direccion: 'Calle Falsa 123'
          }
        }
      ]
    }
  }
  const res = await fetch(`${getApiUrl()}/pedidos/mis-pedidos`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  const data = await res.json()
  return data
}

// Obtener pedido por id
export const obtenerPedidoPorId = async (token: string, id: string) => {
  if (token === 'mock-token') {
    return {
      success: true,
      data: {
        id: 'mock-1',
        negocio_id: 'mock-negocio-1',
        total: 25000,
        estado: 'pendiente',
        created_at: new Date().toISOString(),
        negocio: {
          id: 'mock-negocio-1',
          nombre: 'Ferretería Vecino (Mock)',
          direccion: 'Calle Falsa 123'
        },
        detalles: [
          {
            id: 'mock-detalle-1',
            pedido_id: 'mock-1',
            producto_id: 'mock-producto-1',
            cantidad: 1,
            precio_unitario: 25000,
            subtotal: 25000,
            producto: {
              nombre: 'Martillo de Acero',
              imagen_url: 'https://placehold.co/400x400/gray/white?text=Martillo'
            }
          }
        ]
      }
    }
  }
  const res = await fetch(`${getApiUrl()}/pedidos/${id}`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  const data = await res.json()
  return data
}

// Obtener historial de estados de un pedido
export const obtenerHistorialPedido = async (token: string, id: string) => {
  if (token === 'mock-token') {
    return {
      success: true,
      data: [
        {
          id: 'mock-hist-1',
          pedido_id: id,
          estado_anterior: null,
          estado_nuevo: 'pendiente',
          fecha_cambio: new Date(Date.now() - 3600000).toISOString()
        }
      ]
    }
  }
  const res = await fetch(`${getApiUrl()}/pedidos/${id}/historial`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  const data = await res.json()
  return data
}

// Obtener pedidos de un negocio (HU-09)
export const obtenerPedidosDeNegocio = async (token: string, negocioId: string) => {
  if (token === 'mock-token') {
    return {
      success: true,
      data: [
        {
          id: 'mock-1',
          usuario_id: 'mock-user-1',
          negocio_id: negocioId,
          total: 25000,
          estado: 'pendiente',
          created_at: new Date().toISOString(),
          usuarios: {
            nombre_completo: 'Juan Pérez',
            email: 'juan@example.com'
          }
        }
      ]
    }
  }
  const res = await fetch(`${getApiUrl()}/pedidos/negocio/${negocioId}`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  const data = await res.json()
  return data
}

// Actualizar estado de pedido (HU-09)
export const actualizarEstadoPedido = async (token: string, pedidoId: string, nuevoEstado: string) => {
  if (token === 'mock-token') {
    return {
      success: true,
      data: {
        id: pedidoId,
        estado: nuevoEstado,
        updated_at: new Date().toISOString()
      }
    }
  }
  const res = await fetch(`${getApiUrl()}/pedidos/${pedidoId}/estado`, {
    method: 'PUT',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ estado: nuevoEstado })
  })
  const data = await res.json()
  return data
}

// Crear un nuevo pedido
export const crearPedido = async (token: string, negocioId: string, items: { producto_id: string; cantidad: number }[]) => {
  if (token === 'mock-token') {
    return {
      success: true,
      data: {
        id: 'mock-pedido-' + Date.now(),
        negocio_id: negocioId,
        total: items.reduce((sum, item) => sum + (item.cantidad * 25000), 0),
        estado: 'pendiente',
        created_at: new Date().toISOString(),
        negocio: {
          id: negocioId,
          nombre: 'Negocio Mock',
          direccion: 'Dirección Mock'
        },
        detalles: items.map((item, index) => ({
          id: 'mock-detalle-' + index,
          pedido_id: 'mock-pedido-' + Date.now(),
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: 25000,
          subtotal: item.cantidad * 25000,
          producto: {
            nombre: 'Producto Mock',
            imagen_url: 'https://placehold.co/400x400/gray/white?text=Producto'
          }
        }))
      }
    }
  }
  const res = await fetch(`${getApiUrl()}/pedidos`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ negocio_id: negocioId, items })
  })
  const data = await res.json()
  return data
}

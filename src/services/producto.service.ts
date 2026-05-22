export interface ProductoNegocio {
  id: string
  nombre: string
  categoria: string
  ciudad: string
}

export interface Producto {
  id: string
  negocio_id: string
  nombre: string
  descripcion: string
  precio: number
  imagen_url: string
  activo: boolean
  created_at: string
  updated_at: string
  negocio?: ProductoNegocio
}

interface ApiResponse<T> {
  success: boolean
  mensaje?: string
  total?: number
  data: T
}

interface DatosCrearProducto {
  negocio_id: string
  nombre: string
  descripcion: string
  precio: number
  imagen_url: string
}

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' ? 'http://localhost:4010/api/mock' : '')

  if (!apiUrl) {
    throw new Error('Falta configurar NEXT_PUBLIC_API_URL')
  }

  return apiUrl
}

export const obtenerProductos = async (): Promise<ApiResponse<Producto[]>> => {
  const res = await fetch(`${getApiUrl()}/productos`, {
    cache: 'no-store'
  })

  return await res.json()
}

export const obtenerMisProductos = async (token: string): Promise<ApiResponse<Producto[]>> => {
  if (token === 'mock-token') {
    return {
      success: true,
      data: [
        {
          id: 'prod-mock-1',
          negocio_id: 'mock-1',
          nombre: 'Producto de Prueba',
          descripcion: 'Un producto publicado como prueba visual.',
          precio: 15000,
          imagen_url: 'https://placehold.co/400',
          activo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }
  }

  const res = await fetch(`${getApiUrl()}/productos/mis-productos`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return await res.json()
}

export const crearProducto = async (
  token: string,
  datos: DatosCrearProducto
): Promise<ApiResponse<Producto>> => {
  if (token === 'mock-token') {
    return {
      success: true,
      data: {
        id: `prod-mock-${Date.now()}`,
        ...datos,
        activo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  }

  const res = await fetch(`${getApiUrl()}/productos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  })

  return await res.json()
}

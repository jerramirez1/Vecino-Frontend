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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

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

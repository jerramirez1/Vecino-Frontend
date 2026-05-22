export interface Resena {
  id: string
  negocio_id: string
  usuario_id: string
  calificacion: number
  comentario: string | null
  created_at: string
  updated_at: string
  usuarios?: {
    nombre_completo: string
  }
}

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' ? 'http://localhost:4010/api/mock' : '')

  if (!apiUrl) {
      throw new Error('Falta configurar NEXT_PUBLIC_API_URL')
  }

  return apiUrl
}

export const obtenerResenasNegocio = async (negocioId: string) => {
  const res = await fetch(`${getApiUrl()}/resenas/negocio/${negocioId}`, {
      cache: 'no-store'
  })
  const data = await res.json()
  return data
}

export const crearResena = async (token: string, datos: {
  negocioId: string
  calificacion: number
  comentario: string
}) => {
  const res = await fetch(`${getApiUrl()}/resenas`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(datos)
  })
  const data = await res.json()
  return data
}

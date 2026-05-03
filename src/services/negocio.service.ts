export interface Negocio {
    id: string
    nombre: string
    categoria: string
    direccion: string
    ciudad: string
    horario: string
    descripcion: string
    activo: boolean
}

const getApiUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    if (!apiUrl) {
        throw new Error('Falta configurar NEXT_PUBLIC_API_URL')
    }

    return apiUrl
}

// Obtener todos los negocios
export const obtenerNegocios = async (filtros?: {
    categoria?: string
    ciudad?: string
}) => {
    const params = new URLSearchParams()
    if (filtros?.categoria) params.append('categoria', filtros.categoria)
    if (filtros?.ciudad) params.append('ciudad', filtros.ciudad)

    const res = await fetch(`${getApiUrl()}/negocios?${params}`, {
        cache: 'no-store'
    })
    const data = await res.json()
    return data
}

// Obtener mis negocios (requiere token)
export const obtenerMisNegocios = async (token: string) => {
    const res = await fetch(`${getApiUrl()}/negocios/mis-negocios`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    const data = await res.json()
    return data
}

// Crear negocio (requiere token)
export const crearNegocio = async (token: string, datos: {
    nombre: string
    descripcion: string
    categoria: string
    direccion: string
    ciudad: string
    horario: string
}) => {
    const res = await fetch(`${getApiUrl()}/negocios`, {
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

// Actualizar negocio (requiere token)
export const actualizarNegocio = async (
    token: string,
    id: string,
    datos: Partial<{
        nombre: string
        descripcion: string
        categoria: string
        direccion: string
        ciudad: string
        horario: string
    }>
) => {
    const res = await fetch(`${getApiUrl()}/negocios/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    })
    const data = await res.json()
    return data
}

// Eliminar negocio (requiere token)
export const eliminarNegocio = async (token: string, id: string) => {
    const res = await fetch(`${getApiUrl()}/negocios/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    const data = await res.json()
    return data
}

export interface MarcadorNegocio {
    id: string
    nombre: string
    descripcion: string
    categoria: string
    direccion: string
    ciudad: string
    imagen_url: string | null
    calificacion_promedio: number
    total_resenas: number
    latitud: number
    longitud: number
    distancia_km: number
}

const getApiUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' ? 'http://localhost:4010/api/mock' : '')

    if (!apiUrl) {
        throw new Error('Falta configurar NEXT_PUBLIC_API_URL')
    }

    return apiUrl
}

// Buscar negocios cercanos a una ubicacion (EP-06)
export const buscarNegociosCercanos = async (filtros: {
    lat: number
    lng: number
    radio?: number
    categoria?: string
    ciudad?: string
    calificacionMin?: number
}) => {
    const params = new URLSearchParams()
    params.append('lat', String(filtros.lat))
    params.append('lng', String(filtros.lng))
    if (filtros.radio != null) params.append('radio', String(filtros.radio))
    if (filtros.categoria) params.append('categoria', filtros.categoria)
    if (filtros.ciudad) params.append('ciudad', filtros.ciudad)
    if (filtros.calificacionMin != null) params.append('calificacion_min', String(filtros.calificacionMin))

    const res = await fetch(`${getApiUrl()}/geolocalizacion/cercanos?${params}`, {
        cache: 'no-store'
    })
    const data = await res.json()
    return data
}

// Obtener categorias disponibles de negocios geolocalizados (EP-06)
export const obtenerCategoriasGeolocalizacion = async () => {
    const res = await fetch(`${getApiUrl()}/geolocalizacion/categorias`, {
        cache: 'no-store'
    })
    const data = await res.json()
    return data
}

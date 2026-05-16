import http from 'node:http'

const PORT = Number(process.env.PORT || 4010)
const MOCK_USER_ID = 'mock-vendedor'
const BASE_PATH = '/api/mock'

const now = () => new Date().toISOString()
const id = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`

const negocios = [
  {
    id: 'mock-negocio-1',
    usuario_id: MOCK_USER_ID,
    nombre: 'Panaderia Vecino',
    descripcion: 'Pan y postres listos para probar el flujo de productos.',
    categoria: 'Panadería',
    direccion: 'Calle 2 # 4 - 55',
    ciudad: 'Armenia',
    horario: 'Lunes a Sabado 7:00 AM - 7:00 PM',
    activo: true,
    created_at: now(),
    updated_at: now(),
  },
]

const productos = []

const json = (res, status, payload) => {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  })
  res.end(body)
}

const parseBody = async (req) => {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }

  if (!chunks.length) {
    return {}
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim()
  if (!raw) {
    return {}
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const negocioPublico = (negocio) => ({
  id: negocio.id,
  nombre: negocio.nombre,
  categoria: negocio.categoria,
  ciudad: negocio.ciudad,
  activo: negocio.activo,
})

const negocioCompleto = (negocio) => ({
  id: negocio.id,
  usuario_id: negocio.usuario_id,
  nombre: negocio.nombre,
  descripcion: negocio.descripcion,
  categoria: negocio.categoria,
  direccion: negocio.direccion,
  ciudad: negocio.ciudad,
  horario: negocio.horario,
  activo: negocio.activo,
  created_at: negocio.created_at,
  updated_at: negocio.updated_at,
})

const productoCompleto = (producto) => {
  const negocio = negocios.find((item) => item.id === producto.negocio_id)

  return {
    id: producto.id,
    negocio_id: producto.negocio_id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
    imagen_url: producto.imagen_url,
    activo: producto.activo,
    created_at: producto.created_at,
    updated_at: producto.updated_at,
    negocio: negocio
      ? negocioPublico(negocio)
      : undefined,
  }
}

const responder = (res, status, payload) => json(res, status, payload)

const noEncontrado = (res) =>
  responder(res, 404, {
    success: false,
    mensaje: 'Ruta mock no encontrada',
  })

const validarProducto = (body) => {
  if (!body.negocio_id) return 'Debes seleccionar un negocio'
  if (!body.nombre || !String(body.nombre).trim()) return 'El nombre del producto es obligatorio'
  if (!body.descripcion || !String(body.descripcion).trim()) return 'La descripción del producto es obligatoria'
  if (!body.imagen_url || !String(body.imagen_url).trim()) return 'La imagen del producto es obligatoria'

  const precio = Number(body.precio)
  if (!Number.isFinite(precio) || precio <= 0) return 'El precio del producto debe ser mayor a 0'

  return ''
}

const validarNegocio = (body) => {
  if (!body.nombre || !String(body.nombre).trim()) return 'El nombre del negocio es obligatorio'
  if (!body.categoria || !String(body.categoria).trim()) return 'La categoria del negocio es obligatoria'
  if (!body.direccion || !String(body.direccion).trim()) return 'La direccion del negocio es obligatoria'
  if (!body.ciudad || !String(body.ciudad).trim()) return 'La ciudad del negocio es obligatoria'

  return ''
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

  if (req.method === 'OPTIONS') {
    responder(res, 204, {})
    return
  }

  if (!url.pathname.startsWith(BASE_PATH)) {
    noEncontrado(res)
    return
  }

  const route = url.pathname.slice(BASE_PATH.length) || '/'

  if (req.method === 'GET' && route === '/health') {
    responder(res, 200, {
      success: true,
      mensaje: 'Mock API listo',
      data: { status: 'OK' },
    })
    return
  }

  if (req.method === 'GET' && route === '/negocios') {
    responder(res, 200, {
      success: true,
      total: negocios.filter((negocio) => negocio.activo).length,
      data: negocios.filter((negocio) => negocio.activo).map(negocioPublico),
    })
    return
  }

  if (req.method === 'GET' && route === '/negocios/mis-negocios') {
    responder(res, 200, {
      success: true,
      total: negocios.filter((negocio) => negocio.usuario_id === MOCK_USER_ID).length,
      data: negocios.filter((negocio) => negocio.usuario_id === MOCK_USER_ID).map(negocioCompleto),
    })
    return
  }

  if (req.method === 'POST' && route === '/negocios') {
    const body = await parseBody(req)
    if (!body) {
      responder(res, 400, { success: false, mensaje: 'JSON invalido' })
      return
    }

    const error = validarNegocio(body)
    if (error) {
      responder(res, 400, { success: false, mensaje: error })
      return
    }

    const created = {
      id: id('negocio'),
      usuario_id: MOCK_USER_ID,
      nombre: String(body.nombre).trim(),
      descripcion: String(body.descripcion || '').trim(),
      categoria: String(body.categoria).trim(),
      direccion: String(body.direccion).trim(),
      ciudad: String(body.ciudad).trim(),
      horario: String(body.horario || '').trim(),
      activo: true,
      created_at: now(),
      updated_at: now(),
    }

    negocios.unshift(created)

    responder(res, 201, {
      success: true,
      mensaje: 'Negocio creado en modo mock',
      data: negocioCompleto(created),
    })
    return
  }

  if (req.method === 'GET' && route === '/productos') {
    const data = productos
      .filter((producto) => producto.activo)
      .map(productoCompleto)
      .filter((producto) => producto.negocio?.activo !== false)

    responder(res, 200, {
      success: true,
      total: data.length,
      data,
    })
    return
  }

  if (req.method === 'GET' && route === '/productos/mis-productos') {
    const misNegocios = negocios.filter((negocio) => negocio.usuario_id === MOCK_USER_ID)
    const ids = new Set(misNegocios.map((negocio) => negocio.id))
    const data = productos
      .filter((producto) => ids.has(producto.negocio_id))
      .map(productoCompleto)

    responder(res, 200, {
      success: true,
      total: data.length,
      data,
    })
    return
  }

  if (req.method === 'POST' && route === '/productos') {
    const body = await parseBody(req)
    if (!body) {
      responder(res, 400, { success: false, mensaje: 'JSON invalido' })
      return
    }

    const error = validarProducto(body)
    if (error) {
      responder(res, 400, { success: false, mensaje: error })
      return
    }

    const negocio = negocios.find((item) => item.id === body.negocio_id)
    if (!negocio) {
      responder(res, 404, { success: false, mensaje: 'Negocio no encontrado' })
      return
    }

    const created = {
      id: id('producto'),
      negocio_id: negocio.id,
      nombre: String(body.nombre).trim(),
      descripcion: String(body.descripcion).trim(),
      precio: Number(body.precio),
      imagen_url: String(body.imagen_url).trim(),
      activo: true,
      created_at: now(),
      updated_at: now(),
    }

    productos.unshift(created)

    responder(res, 201, {
      success: true,
      mensaje: 'Producto creado en modo mock',
      data: productoCompleto(created),
    })
    return
  }

  noEncontrado(res)
})

server.listen(PORT, () => {
  console.log(`Mock API listening on http://localhost:${PORT}${BASE_PATH}`)
})

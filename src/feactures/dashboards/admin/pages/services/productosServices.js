// ================== CONFIG ==================
const API_URL = "http://localhost:3000/api"

// ================== PRODUCTOS ==================
export const getProductos = async () => {
  const res = await fetch(`${API_URL}/productos`)
  if (!res.ok) throw new Error("Error obteniendo productos")
  return res.json()
}

export const getProductoById = async (id) => {
  const res = await fetch(`${API_URL}/productos/${id}`)
  if (!res.ok) throw new Error("Error obteniendo producto")
  return res.json()
}

export const createProducto = async (data) => {
  const res = await fetch(`${API_URL}/productos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Error creando producto")
  return res.json()
}

export const updateProducto = async (id, data) => {
  const res = await fetch(`${API_URL}/productos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Error actualizando producto")
  return res.json()
}

export const deleteProducto = async (id) => {
  const res = await fetch(`${API_URL}/productos/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Error eliminando producto")
  return res.json()
}

// ================== COLORES ==================
export const getColores = async () => {
  const res = await fetch(`${API_URL}/colores`)
  if (!res.ok) throw new Error("Error obteniendo colores")
  return res.json()
}

export const createColor = async (data) => {
  const res = await fetch(`${API_URL}/colores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Error creando color")
  return res.json()
}

export const updateColor = async (id, data) => {
  const res = await fetch(`${API_URL}/colores/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Error actualizando color")
  return res.json()
}

export const deleteColor = async (id) => {
  const res = await fetch(`${API_URL}/colores/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Error eliminando color")
  return res.json()
}

// ================== VARIANTES ==================
export const getVariantes = async () => {
  const res = await fetch(`${API_URL}/variantes`)
  if (!res.ok) throw new Error("Error obteniendo variantes")
  return res.json()
}

export const createVariante = async (data) => {
  const res = await fetch(`${API_URL}/variantes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Error creando variante")
  return res.json()
}

export const updateVariante = async (id, data) => {
  const res = await fetch(`${API_URL}/variantes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Error actualizando variante")
  return res.json()
}

export const deleteVariante = async (id) => {
  const res = await fetch(`${API_URL}/variantes/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Error eliminando variante")
  return res.json()
}

// ================== TALLAS ==================
export const getTallas = async () => {
  const res = await fetch(`${API_URL}/tallas`)
  if (!res.ok) throw new Error("Error obteniendo tallas")
  return res.json()
}

export const createTalla = async (data) => {
  const res = await fetch(`${API_URL}/tallas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Error creando talla")
  return res.json()
}

export const updateTalla = async (id, data) => {
  const res = await fetch(`${API_URL}/tallas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Error actualizando talla")
  return res.json()
}

export const deleteTalla = async (id) => {
  const res = await fetch(`${API_URL}/tallas/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Error eliminando talla")
  return res.json()
}

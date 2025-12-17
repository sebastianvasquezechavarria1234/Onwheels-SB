import api from "../../../../../services/api";

// ================== PRODUCTOS ==================
export const getProductos = async () => {
  const res = await api.get("/productos");
  return res.data;
};

export const getProductoById = async (id) => {
  const res = await api.get(`/productos/${id}`);
  return res.data;
};

export const createProducto = async (data) => {
  const res = await api.post("/productos", data);
  return res.data;
};

export const updateProducto = async (id, data) => {
  const res = await api.put(`/productos/${id}`, data);
  return res.data;
};

export const deleteProducto = async (id) => {
  const res = await api.delete(`/productos/${id}`);
  return res.data;
};

// ================== COLORES ==================
export const getColores = async () => {
  const res = await api.get("/colores");
  return res.data;
};

export const createColor = async (data) => {
  const res = await api.post("/colores", data);
  return res.data;
};

export const updateColor = async (id, data) => {
  const res = await api.put(`/colores/${id}`, data);
  return res.data;
};

export const deleteColor = async (id) => {
  const res = await api.delete(`/colores/${id}`);
  return res.data;
};

// ================== VARIANTES ==================
export const getVariantes = async () => {
  const res = await api.get("/variantes");
  return res.data;
};

export const createVariante = async (data) => {
  const res = await api.post("/variantes", data);
  return res.data;
};

export const updateVariante = async (id, data) => {
  const res = await api.put(`/variantes/${id}`, data);
  return res.data;
};

export const deleteVariante = async (id) => {
  const res = await api.delete(`/variantes/${id}`);
  return res.data;
};

// ================== TALLAS ==================
export const getTallas = async () => {
  const res = await api.get("/tallas");
  return res.data;
};

export const createTalla = async (data) => {
  const res = await api.post("/tallas", data);
  return res.data;
};

export const updateTalla = async (id, data) => {
  const res = await api.put(`/tallas/${id}`, data);
  return res.data;
};

export const deleteTalla = async (id) => {
  const res = await api.delete(`/tallas/${id}`);
  return res.data;
};

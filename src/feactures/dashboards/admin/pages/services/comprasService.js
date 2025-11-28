// src/services/comprasService.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // confirma que coincide con tu backend
  timeout: 30000, // 30s en vez de 10s
  headers: { "Content-Type": "application/json" }
});

// Wrap simple requests to centralizar errores (opcional)
const handle = async (promise) => {
  try {
    const res = await promise;
    return res.data;
  } catch (err) {
    // devuelve el error para que el front muestre notificación adecuada
    throw err;
  }
};

export const getCompras = () => handle(api.get("/compras"));
export const getCompraById = (id) => handle(api.get(`/compras/${id}`));
export const createCompra = (data) => handle(api.post("/compras", data));
export const updateCompra = (id, data) => handle(api.put(`/compras/${id}`, data));
export const deleteCompra = (id) => handle(api.delete(`/compras/${id}`));
export const updateCompraStatus = (id, payload) => handle(api.patch(`/compras/${id}/status`, payload));

export const getProveedores = () => handle(api.get("/proveedores"));
export const getComprasByProveedor = (nit) => handle(api.get(`/compras?nit=${encodeURIComponent(nit)}`));
export const getProductos = () => handle(api.get("/productos"));

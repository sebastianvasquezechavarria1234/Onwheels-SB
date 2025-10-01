// src/services/comprasService.js
import axios from "axios";

// Configuración centralizada
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Servicios de COMPRAS
export const getCompras = () => api.get("/compras").then(res => res.data);
export const getCompraById = (id) => api.get(`/compras/${id}`).then(res => res.data);
export const createCompra = (data) => api.post("/compras", data).then(res => res.data);
export const updateCompra = (id, data) => api.put(`/compras/${id}`, data).then(res => res.data);
export const deleteCompra = (id) => api.delete(`/compras/${id}`).then(res => res.data);
export const updateCompraStatus = (id, payload) =>
  api.patch(`/compras/${id}/status`, payload).then(res => res.data);

// Servicios de PROVEEDORES (necesarios en el CRUD de compras)
export const getProveedores = () => api.get("/proveedores").then(res => res.data);
export const getComprasByProveedor = (nit) =>
  api.get(`/compras?NIT_proveedor=${nit}`).then(res => res.data);

// Servicios de PRODUCTOS (con variantes)
export const getProductos = () => api.get("/productos").then(res => res.data);

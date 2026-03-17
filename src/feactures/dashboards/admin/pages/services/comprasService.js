// src/feactures/dashboards/admin/pages/services/comprasService.js
import api from "../../../../../services/api";

const handle = async (promise) => {
  try {
    const res = await promise;
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getCompras = (params = {}) => handle(api.get("/compras", { params }));
export const getCompraById = (id) => handle(api.get(`/compras/${id}`));
export const createCompra = (data) => handle(api.post("/compras", data));
export const updateCompra = (id, data) => handle(api.put(`/compras/${id}`, data));
export const deleteCompra = (id) => handle(api.delete(`/compras/${id}`));
export const updateCompraStatus = (id, payload) => handle(api.patch(`/compras/${id}/status`, payload));

export const getProveedores = (params = {}) => handle(api.get("/proveedores", { params }));
export const getComprasByProveedor = (nit) => handle(api.get(`/compras?nit=${encodeURIComponent(nit)}`));
export const getProductos = () => handle(api.get("/productos"));

const comprasService = {
  getCompras,
  getAllCompras: getCompras,
  getCompraById,
  createCompra,
  updateCompra,
  deleteCompra,
  updateCompraStatus,
  getProveedores,
  getComprasByProveedor,
  getProductos
};

export default comprasService;

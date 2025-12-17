// ================== CONFIG ==================
import api from "../../../../../services/api";
const API_URL = "/ventas";

// ================== VENTAS ==================

export const getVentas = async () => {
  const res = await api.get(API_URL);
  return res.data;
};

export const getVentaById = async (id) => {
  const res = await api.get(`${API_URL}/${id}`);
  return res.data;
};

export const createVenta = async (data) => {
  const res = await api.post(API_URL, data);
  return res.data;
};

export const updateVenta = async (id, data) => {
  const res = await api.put(`${API_URL}/${id}`, data);
  return res.data;
};

export const deleteVenta = async (id) => {
  const res = await api.delete(`${API_URL}/${id}`);
  return res.data;
};

export const updateVentaStatus = async (id, data) => {
  const res = await api.put(`${API_URL}/${id}/status`, data);
  return res.data;
};

export const cancelVenta = async (id) => {
  const res = await api.put(`${API_URL}/${id}/cancel`);
  return res.data;
};
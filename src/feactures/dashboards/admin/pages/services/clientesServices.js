// ================== CONFIG ==================
import api from "../../../../../services/api";

const API_Endpoint = "/clientes-data";

// ================== CLIENTES ==================

export const getClientes = async () => {
  const res = await api.get(API_Endpoint);
  return res.data;
};

export const getClienteById = async (id) => {
  const res = await api.get(`${API_Endpoint}/${id}`);
  return res.data;
};

export const createCliente = async (data) => {
  const res = await api.post(API_Endpoint, data);
  return res.data;
};

export const updateCliente = async (id, data) => {
  const res = await api.put(`${API_Endpoint}/${id}`, data);
  return res.data;
};

export const deleteCliente = async (id) => {
  const res = await api.delete(`${API_Endpoint}/${id}`);
  return res.data;
};

export const getUsuariosSinCliente = async () => {
  const res = await api.get('/usuarios/sin-cliente');
  return res.data;
};
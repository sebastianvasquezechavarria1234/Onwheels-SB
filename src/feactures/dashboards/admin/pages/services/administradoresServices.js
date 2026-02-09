// src/features/dashboards/admin/services/administradoresServices.js
import api from "../../../../../services/api";

const API_URL = "/administradores";

export const getAdministradores = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

export const getUsuariosSoloConRolCliente = async () => {
  const response = await api.get("/usuarios/rol/solo-cliente");
  return response.data;
};

export const getAdministradorById = async (id) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

export const createAdministrador = async (adminData) => {
  const response = await api.post(API_URL, adminData);
  return response.data;
};

export const updateAdministrador = async (id, adminData) => {
  const response = await api.put(`${API_URL}/${id}`, adminData);
  return response.data;
};

export const deleteAdministrador = async (id) => {
  const response = await api.delete(`${API_URL}/${id}`);
  return response.data;
};

export const getUsuariosSinRol = async () => {
  const response = await api.get(`${API_URL}/usuarios/disponibles`);
  return response.data;
};
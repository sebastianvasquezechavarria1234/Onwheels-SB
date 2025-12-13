// src/features/dashboards/admin/services/administradoresServices.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/administradores";

export const getAdministradores = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getUsuariosSoloConRolCliente = async () => {
  const response = await axios.get("http://localhost:3000/api/usuarios/rol/solo-cliente");
  return response.data;
};

export const getAdministradorById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createAdministrador = async (adminData) => {
  const response = await axios.post(API_URL, adminData);
  return response.data;
};

export const updateAdministrador = async (id, adminData) => {
  const response = await axios.put(`${API_URL}/${id}`, adminData);
  return response.data;
};

export const deleteAdministrador = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

export const getUsuariosSinRol = async () => {
  const response = await axios.get(`${API_URL}/usuarios/disponibles`);
  return response.data;
};
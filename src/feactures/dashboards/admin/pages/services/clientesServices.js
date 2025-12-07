// src/features/dashboards/admin/services/clientesServices.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/clientes-data";
const API_USUARIOS = "http://localhost:3000/api/usuarios"; // si también usas esta
// === Clientes ===
export const getClientes = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createCliente = async (clienteData) => {
  const response = await axios.post(API_URL, clienteData);
  return response.data;
};

export const updateCliente = async (id, clienteData) => {
  const response = await axios.put(`${API_URL}/${id}`, clienteData);
  return response.data;
};

export const deleteCliente = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

// === Usuarios (para selección al crear cliente) ===
export const getUsuariosSinCliente = async () => {
  // Esta ruta debe devolver SOLO usuarios que NO tienen perfil de cliente
  const response = await axios.get(`${API_USUARIOS}/sin-cliente`);
  return response.data;
};